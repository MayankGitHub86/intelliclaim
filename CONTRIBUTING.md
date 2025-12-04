# Contributing to IntelliClaim

Thank you for your interest in contributing to IntelliClaim! We welcome contributions from the community and are excited to see what you'll bring to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Submitting Changes](#submitting-changes)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing](#testing)
- [Documentation](#documentation)

## 🤝 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to adityadhimaann@gmail.com.

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18+)
- Python (3.11+)
- Git
- Docker & Docker Compose (optional)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
```bash
git clone https://github.com/your-username/intelliclaim.git
cd intelliclaim
```

3. Add the original repository as upstream:
```bash
git remote add upstream https://github.com/adityadhimaann/intelliclaim.git
```

## 🛠️ Development Setup

### Backend Setup

```bash
cd intelliclaim-vision-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install -r requirements-dev.txt  # Development dependencies
```

### Frontend Setup

```bash
cd frontend
npm install
```

### Environment Configuration

1. Copy environment files:
```bash
cp intelliclaim-vision-backend/.env.example intelliclaim-vision-backend/.env
cp frontend/.env.example frontend/.env
```

2. Fill in your configuration values in both `.env` files

### Database Setup

```bash
# Using Docker (recommended)
docker-compose up -d postgres redis

# Run migrations
cd intelliclaim-vision-backend
alembic upgrade head
```

## 🔄 Making Changes

### Branching Strategy

1. Create a new branch for your feature/fix:
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b bugfix/issue-description
```

2. Make your changes in logical, atomic commits
3. Write clear, descriptive commit messages

### Commit Message Format

We follow the Conventional Commits specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

Examples:
```bash
feat(auth): add JWT token refresh mechanism
fix(api): resolve CORS issue for file uploads
docs(readme): update installation instructions
test(claims): add unit tests for claim processing
```

## 🚀 Submitting Changes

### Before Submitting

1. **Update your branch** with the latest upstream changes:
```bash
git fetch upstream
git rebase upstream/main
```

2. **Run tests** to ensure everything works:
```bash
# Backend tests
cd intelliclaim-vision-backend
pytest

# Frontend tests  
cd frontend
npm test
```

3. **Check code formatting**:
```bash
# Backend
black app/
isort app/
mypy app/

# Frontend
npm run lint
npm run format
```

### Creating a Pull Request

1. Push your branch to your fork:
```bash
git push origin feature/your-feature-name
```

2. Create a Pull Request on GitHub with:
   - Clear title and description
   - Link to related issues
   - Screenshots (if UI changes)
   - Testing instructions

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added new tests for new functionality
- [ ] Manual testing completed

## Screenshots (if applicable)

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
```

## 📝 Code Style Guidelines

### Python (Backend)

- Follow PEP 8
- Use type hints for all functions
- Maximum line length: 88 characters
- Use Black for formatting
- Use isort for import sorting

```python
from typing import List, Optional

async def process_claim(
    claim_id: str, 
    documents: List[str],
    user_id: Optional[str] = None
) -> Dict[str, Any]:
    """Process insurance claim with AI analysis.
    
    Args:
        claim_id: Unique identifier for the claim
        documents: List of document paths to analyze
        user_id: Optional user identifier
        
    Returns:
        Dictionary containing analysis results
        
    Raises:
        ValidationError: If claim_id is invalid
        ProcessingError: If document analysis fails
    """
    # Implementation here
    pass
```

### TypeScript (Frontend)

- Use TypeScript strict mode
- Follow React functional component patterns
- Use ESLint + Prettier configuration
- Maximum line length: 100 characters

```typescript
interface ClaimAnalysisProps {
  claimId: string;
  documents: Document[];
  onAnalysisComplete?: (results: AnalysisResults) => void;
}

export const ClaimAnalysis: React.FC<ClaimAnalysisProps> = ({
  claimId,
  documents,
  onAnalysisComplete
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<AnalysisResults | null>(null);

  // Component implementation
  return (
    <div className="claim-analysis">
      {/* JSX content */}
    </div>
  );
};
```

### CSS/Tailwind

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Use CSS custom properties for theming
- Maintain consistent spacing scale

## 🧪 Testing

### Backend Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_claims.py

# Run tests with verbose output
pytest -v
```

Test structure:
```python
import pytest
from fastapi.testclient import TestClient

def test_create_claim_success(client: TestClient, sample_user):
    """Test successful claim creation."""
    response = client.post("/api/claims/", json={
        "title": "Test Claim",
        "description": "Test description"
    })
    assert response.status_code == 201
    assert response.json()["title"] == "Test Claim"
```

### Frontend Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode  
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run e2e tests
npm run test:e2e
```

Test structure:
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ClaimForm } from '../ClaimForm';

describe('ClaimForm', () => {
  it('should submit form with valid data', async () => {
    const onSubmit = jest.fn();
    render(<ClaimForm onSubmit={onSubmit} />);
    
    fireEvent.change(screen.getByLabelText('Claim Title'), {
      target: { value: 'Test Claim' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    
    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Test Claim'
    });
  });
});
```

## 📚 Documentation

### Code Documentation

- Write clear docstrings for all functions and classes
- Include type information and examples
- Document complex algorithms and business logic
- Keep README and API docs updated

### API Documentation

- Use FastAPI's automatic OpenAPI generation
- Add detailed descriptions to endpoints
- Include request/response examples
- Document error codes and messages

### Component Documentation

- Document React component props and usage
- Include Storybook stories for UI components
- Provide usage examples
- Document accessibility considerations

## 🏷️ Issue Labels

We use the following labels to categorize issues:

- `bug` - Something isn't working
- `enhancement` - New feature or request  
- `documentation` - Improvements or additions to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `question` - Further information is requested
- `wontfix` - This will not be worked on

## 🎯 Areas for Contribution

We're particularly looking for help in these areas:

### 🚀 High Priority
- AI model improvements and optimization
- Performance enhancements
- Security audits and improvements
- Mobile app development
- Additional language support

### 🔧 Medium Priority  
- UI/UX improvements
- Additional file format support
- Advanced analytics features
- Integration with third-party services
- Automated testing improvements

### 📚 Documentation
- Tutorial improvements
- API documentation enhancements
- Code examples and demos
- Video tutorials
- Translation of documentation

## ❓ Questions?

If you have any questions about contributing, please:

1. Check existing [Issues](https://github.com/adityadhimaann/intelliclaim/issues) and [Discussions](https://github.com/adityadhimaann/intelliclaim/discussions)
2. Create a new Discussion for general questions
3. Email us at adityadhimaann@gmail.com

## 🙏 Recognition

Contributors will be recognized in:
- README acknowledgments
- Release notes
- Contributors page (coming soon)
- Annual contributor highlights

Thank you for contributing to IntelliClaim! 🚀
