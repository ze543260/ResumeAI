<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Resume Analyzer AI - Copilot Instructions

## Project Overview

This is a full-stack Resume Analysis Platform with AI integration. The project consists of:

- **Frontend**: React with TypeScript, Tailwind CSS, and modern UI components
- **Backend**: Django REST Framework (to be implemented)
- **AI Integration**: OpenAI API for resume parsing and analysis
- **Database**: PostgreSQL (to be implemented)

## Code Style and Standards

- Use TypeScript for all React components and utilities
- Follow React functional component patterns with hooks
- Use Tailwind CSS for styling with semantic class names
- Implement proper error handling and loading states
- Use React Query for API state management
- Follow RESTful API conventions

## Component Structure

- Components should be functional with proper TypeScript interfaces
- Use proper prop validation and default values
- Implement responsive design using Tailwind CSS
- Include loading states, error boundaries, and accessibility features

## AI Integration Guidelines

- Use OpenAI API for text analysis and extraction
- Implement proper rate limiting and error handling
- Store analysis results in structured format
- Provide meaningful feedback and suggestions

## Backend Integration (Django)

- Use Django REST Framework for API endpoints
- Implement JWT authentication
- Use Celery for background tasks (file processing)
- Implement proper file upload handling for PDFs/DOCs
- Use appropriate serializers and viewsets

## Key Features to Implement

1. Resume file upload with drag-and-drop
2. AI-powered resume parsing and analysis
3. Scoring system for different resume sections
4. Dashboard with analytics and visualizations
5. Job matching capabilities
6. Export functionality for analysis reports

## Security Considerations

- Validate file uploads (type, size, content)
- Sanitize extracted text data
- Implement proper authentication and authorization
- Use environment variables for sensitive data
- Implement rate limiting for AI API calls
