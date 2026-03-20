import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { apiClient, API_CONFIG } from '../config/api';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Play,
  Save,
  Upload,
  Download,
  Trash2,
  Copy,
  FileText,
  Brain,
  Mail,
  Database,
  Webhook,
  Zap,
  GitBranch,
  Settings,
  Eye
} from 'lucide-react';

interface WorkflowNode {
  id: string;
  type: 'input' | 'ai' | 'action' | 'decision';
  title: string;
  x: number;
  y: number;
  connections: string[];
}

interface Workflow {
  id?: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  connections: any[];
}

export function WorkflowBuilder() {
  const [nodes, setNodes] = useState([
    {
      id: '1',
      type: 'input',
      title: 'Document Upload',
      x: 100,
      y: 100,
      connections: ['2']
    },
    {
      id: '2',
      type: 'ai',
      title: 'AI Analysis',
      x: 350,
      y: 100,
      connections: ['3']
    },
    {
      id: '3',
      type: 'decision',
      title: 'Approval Decision',
      x: 600,
      y: 100,
      connections: ['4', '5']
    },
    {
      id: '4',
      type: 'action',
      title: 'Send Approval Email',
      x: 500,
      y: 250,
      connections: []
    },
    {
      id: '5',
      type: 'action',
      title: 'Request Review',
      x: 700,
      y: 250,
      connections: []
    }
  ]);

  const [selectedNode, setSelectedNode] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [workflowName, setWorkflowName] = useState('Claim Processing Workflow');
  const [workflowDescription, setWorkflowDescription] = useState('Automated claim processing with AI analysis');
  const [availableWorkflows, setAvailableWorkflows] = useState([]);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);

  // Handle node dragging
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    setIsDragging(true);
    setDraggedNode(nodeId);
    setDragOffset({
      x: e.clientX - node.x,
      y: e.clientY - node.y
    });
    e.stopPropagation();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !draggedNode) return;
    
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    
    const newX = e.clientX - canvasRect.left - dragOffset.x;
    const newY = e.clientY - canvasRect.top - dragOffset.y;
    
    setNodes(prevNodes =>
      prevNodes.map(node =>
        node.id === draggedNode
          ? { ...node, x: Math.max(0, newX), y: Math.max(0, newY) }
          : node
      )
    );
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedNode(null);
  };

  // Delete selected node
  const handleDeleteNode = () => {
    if (!selectedNode) return;
    
    setNodes(prevNodes => {
      // Remove the node
      const filtered = prevNodes.filter(n => n.id !== selectedNode);
      
      // Remove connections to this node
      return filtered.map(node => ({
        ...node,
        connections: node.connections.filter(id => id !== selectedNode)
      }));
    });
    
    setSelectedNode(null);
    toast.success('Node deleted successfully');
  };

  // Duplicate selected node
  const handleDuplicateNode = () => {
    if (!selectedNode) return;
    
    const nodeToDuplicate = nodes.find(n => n.id === selectedNode);
    if (!nodeToDuplicate) return;
    
    const newNode = {
      ...nodeToDuplicate,
      id: `${Date.now()}`,
      x: nodeToDuplicate.x + 50,
      y: nodeToDuplicate.y + 50,
      connections: []
    };
    
    setNodes(prevNodes => [...prevNodes, newNode]);
    setSelectedNode(newNode.id);
    toast.success('Node duplicated successfully');
  };

  // Update node title
  const handleUpdateNodeTitle = (nodeId: string, newTitle: string) => {
    setNodes(prevNodes =>
      prevNodes.map(node =>
        node.id === nodeId ? { ...node, title: newTitle } : node
      )
    );
  };

  // Load existing workflows
  useEffect(() => {
    const loadWorkflows = async () => {
      try {
        const workflows = await apiClient.get(API_CONFIG.ENDPOINTS.WORKFLOWS.LIST);
        setAvailableWorkflows(workflows);
      } catch (error: any) {
        console.error('Failed to load workflows:', error);
        toast.error('Failed to load existing workflows');
      }
    };
    
    loadWorkflows();
  }, []);

  // Save workflow
  const handleSaveWorkflow = async () => {
    try {
      setLoading(true);
      const workflowData = {
        name: workflowName,
        description: workflowDescription,
        nodes: nodes,
        connections: nodes.flatMap(node => 
          node.connections.map(connectionId => ({
            from: node.id,
            to: connectionId
          }))
        )
      };
      
      const savedWorkflow = await apiClient.post(
        API_CONFIG.ENDPOINTS.WORKFLOWS.CREATE,
        workflowData
      );
      
      toast.success(`Workflow "${workflowName}" saved successfully!`);
      
      // Refresh workflow list
      const workflows = await apiClient.get(API_CONFIG.ENDPOINTS.WORKFLOWS.LIST);
      setAvailableWorkflows(workflows);
      
    } catch (error: any) {
      console.error('Failed to save workflow:', error);
      toast.error('Failed to save workflow. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load specific workflow
  const handleLoadWorkflow = async (workflowId: string) => {
    try {
      const workflow = await apiClient.get(
        API_CONFIG.ENDPOINTS.WORKFLOWS.GET(workflowId)
      );
      
      setNodes(workflow.nodes || []);
      setWorkflowName(workflow.name);
      setWorkflowDescription(workflow.description);
      
      toast.success(`Workflow "${workflow.name}" loaded successfully!`);
      
    } catch (error: any) {
      console.error('Failed to load workflow:', error);
      toast.error('Failed to load workflow');
    }
  };

  const nodeTypes = [
    {
      category: 'Inputs',
      items: [
        { type: 'input', icon: <FileText className="w-4 h-4" />, title: 'Document Input', color: 'from-blue-500 to-cyan-500' },
        { type: 'input', icon: <Upload className="w-4 h-4" />, title: 'File Upload', color: 'from-blue-500 to-cyan-500' },
        { type: 'input', icon: <Database className="w-4 h-4" />, title: 'Form Data', color: 'from-blue-500 to-cyan-500' }
      ]
    },
    {
      category: 'AI Nodes',
      items: [
        { type: 'ai', icon: <Brain className="w-4 h-4" />, title: 'LLM Process', color: 'from-purple-500 to-pink-500' },
        { type: 'ai', icon: <Eye className="w-4 h-4" />, title: 'Vision AI', color: 'from-purple-500 to-pink-500' },
        { type: 'ai', icon: <GitBranch className="w-4 h-4" />, title: 'Decision Tree', color: 'from-purple-500 to-pink-500' }
      ]
    },
    {
      category: 'Actions',
      items: [
        { type: 'action', icon: <Mail className="w-4 h-4" />, title: 'Send Email', color: 'from-green-500 to-emerald-500' },
        { type: 'action', icon: <Database className="w-4 h-4" />, title: 'Save to DB', color: 'from-green-500 to-emerald-500' },
        { type: 'action', icon: <Webhook className="w-4 h-4" />, title: 'API Call', color: 'from-green-500 to-emerald-500' }
      ]
    }
  ];

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'input':
        return 'from-blue-500 to-cyan-500';
      case 'ai':
        return 'from-purple-500 to-pink-500';
      case 'action':
        return 'from-green-500 to-emerald-500';
      case 'decision':
        return 'from-orange-500 to-red-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'input':
        return <FileText className="w-5 h-5" />;
      case 'ai':
        return <Brain className="w-5 h-5" />;
      case 'action':
        return <Zap className="w-5 h-5" />;
      case 'decision':
        return <GitBranch className="w-5 h-5" />;
      default:
        return <Settings className="w-5 h-5" />;
    }
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-gradient-to-br from-background via-background to-purple-50/30 dark:to-purple-950/30">
      {/* Sidebar */}
      <motion.div
        className="w-full lg:w-80 bg-background/80 backdrop-blur-sm border-b lg:border-b-0 lg:border-r border-border/50 flex flex-col max-h-60 lg:max-h-none"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="p-4 lg:p-6 border-b border-border/50">
          <h2 className="text-xl lg:text-2xl font-bold mb-2">
            Workflow <span className="bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] bg-clip-text text-transparent">Builder</span>
          </h2>
          <p className="text-sm text-muted-foreground">Drag and drop to create workflows</p>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search components..." className="pl-10" />
          </div>
        </div>

        {/* Component Library */}
        <div className="flex-1 p-4 space-y-4 lg:space-y-6 overflow-y-auto">
          {nodeTypes.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h3 className="font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wider">
                {category.category}
              </h3>
              <div className="space-y-2">
                {category.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className={`p-3 bg-gradient-to-r ${item.color} rounded-lg text-white cursor-grab active:cursor-grabbing shadow-md hover:shadow-lg transition-all duration-200`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        {item.icon}
                      </div>
                      <span className="font-medium text-sm">{item.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-border/50 space-y-2">
          <Button 
            className="w-full bg-gradient-to-r from-[#0066FF] to-[#8B5CF6]"
            onClick={handleSaveWorkflow}
            disabled={loading}
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Workflow'}
          </Button>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" size="sm">
              <Copy className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <motion.div
          className="p-2 sm:p-4 bg-background/80 backdrop-blur-sm border-b border-border/50 flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto">
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Add Node</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDeleteNode}
              disabled={!selectedNode}
            >
              <Trash2 className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
            <div className="hidden sm:block h-6 w-px bg-border" />
            <Button variant="outline" size="sm">
              <Play className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Test Run</span>
            </Button>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm">
            <Badge variant="secondary" className="hidden sm:inline-flex">Auto-saved 2m ago</Badge>
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground">Zoom:</span>
              <Button variant="outline" size="sm">-</Button>
              <span className="font-medium px-2 sm:px-3">100%</span>
              <Button variant="outline" size="sm">+</Button>
            </div>
          </div>
        </motion.div>

        {/* Canvas Area */}
        <motion.div
          ref={canvasRef}
          className="flex-1 relative overflow-auto bg-gradient-to-br from-muted/30 to-muted/10"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Scrollable content wrapper */}
          <div className="relative min-w-[1200px] min-h-[800px] w-full h-full">
          {/* Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          />

          {/* Simplified Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {nodes.map(node => 
              node.connections.map(connectionId => {
                const targetNode = nodes.find(n => n.id === connectionId);
                if (!targetNode) return null;
                
                return (
                  <line
                    key={`${node.id}-${connectionId}`}
                    x1={node.x + 120}
                    y1={node.y + 40}
                    x2={targetNode.x}
                    y2={targetNode.y + 40}
                    stroke="#8B5CF6"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    opacity="0.6"
                  />
                );
              })
            )}
          </svg>

          {/* Workflow Nodes */}
          {nodes.map((node, index) => (
            <motion.div
              key={node.id}
              className={`absolute w-30 cursor-move ${selectedNode === node.id ? 'z-20' : 'z-10'}`}
              style={{ left: node.x, top: node.y }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -2 }}
              onClick={() => setSelectedNode(node.id)}
              onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
            >
              <Card className={`w-30 bg-gradient-to-br ${getNodeColor(node.type)} text-white border-none shadow-lg hover:shadow-xl transition-all duration-200 ${
                selectedNode === node.id ? 'ring-2 ring-white ring-opacity-50' : ''
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      {getNodeIcon(node.type)}
                    </div>
                    <span className="font-medium text-sm">{node.title}</span>
                  </div>
                  
                  {/* Connection Points */}
                  <div className="flex justify-between items-center">
                    <div className="w-3 h-3 bg-white/30 rounded-full border-2 border-white/50" />
                    <div className="text-xs opacity-80 capitalize">{node.type}</div>
                    <div className="w-3 h-3 bg-white/30 rounded-full border-2 border-white/50" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* Node Properties Panel */}
          {selectedNode && (
            <motion.div
              className="absolute top-4 right-4 w-72 sm:w-80 max-w-[calc(100vw-2rem)]"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-background/90 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Node Properties</CardTitle>
                  <CardDescription>
                    Configure the selected node
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Node Title</label>
                    <Input 
                      value={nodes.find(n => n.id === selectedNode)?.title || ''} 
                      onChange={(e) => handleUpdateNodeTitle(selectedNode, e.target.value)}
                      placeholder="Enter node title..."
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Type</label>
                    <Badge variant="secondary" className="text-xs">
                      {nodes.find(n => n.id === selectedNode)?.type}
                    </Badge>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Configuration</label>
                    <div className="space-y-2">
                      <Input placeholder="Parameter 1..." />
                      <Input placeholder="Parameter 2..." />
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={handleDuplicateNode}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={handleDeleteNode}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Help Overlay */}
          <motion.div
            className="absolute bottom-4 left-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Card className="bg-background/90 backdrop-blur-sm border-border/50">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2 flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-[#8B5CF6]" />
                  <span>Quick Tips</span>
                </h4>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• Drag components from the sidebar</li>
                  <li>• Click nodes to configure properties</li>
                  <li>• Connect nodes by dragging between ports</li>
                  <li>• Use Ctrl+S to save your workflow</li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}