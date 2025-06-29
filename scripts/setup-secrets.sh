#!/bin/bash

# =============================================================================
# Setup GitHub Secrets Script
# =============================================================================
# Este script configura automáticamente los secrets de GitHub necesarios
# para el proyecto Kopp CRM Automation leyendo las variables del archivo .env
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project info
PROJECT_NAME="Kopp CRM Automation"
REPO_NAME="kopp-stadium/kopp-crm-automation"

echo -e "${BLUE}🚀 Setup GitHub Secrets for ${PROJECT_NAME}${NC}"
echo "=================================================="

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo -e "${YELLOW}💡 Please create a .env file based on .env.example${NC}"
    echo ""
    echo "Example:"
    echo "cp .env.example .env"
    echo "# Edit .env with your actual values"
    exit 1
fi

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ Error: GitHub CLI (gh) is not installed${NC}"
    echo -e "${YELLOW}💡 Install GitHub CLI: https://cli.github.com/${NC}"
    echo ""
    echo "macOS: brew install gh"
    echo "Ubuntu: curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg"
    exit 1
fi

# Check if user is authenticated with GitHub CLI
if ! gh auth status &> /dev/null; then
    echo -e "${RED}❌ Error: Not authenticated with GitHub CLI${NC}"
    echo -e "${YELLOW}💡 Please authenticate first: gh auth login${NC}"
    exit 1
fi

# Function to read .env file
read_env_file() {
    # Source .env file while ignoring comments and empty lines
    export $(grep -v '^#' .env | grep -v '^$' | xargs)
}

# Function to set GitHub secret
set_github_secret() {
    local secret_name=$1
    local secret_value=$2
    
    if [ -z "$secret_value" ]; then
        echo -e "${YELLOW}⚠️  Warning: $secret_name is empty, skipping...${NC}"
        return 1
    fi
    
    echo -n "Setting $secret_name... "
    if echo "$secret_value" | gh secret set "$secret_name" --repo="$REPO_NAME"; then
        echo -e "${GREEN}✅${NC}"
        return 0
    else
        echo -e "${RED}❌${NC}"
        return 1
    fi
}

# Function to validate required secrets
validate_secrets() {
    local required_secrets=("HUBSPOT_API_KEY" "SLACK_WEBHOOK_URL")
    local missing_secrets=()
    
    for secret in "${required_secrets[@]}"; do
        if [ -z "${!secret}" ]; then
            missing_secrets+=("$secret")
        fi
    done
    
    if [ ${#missing_secrets[@]} -gt 0 ]; then
        echo -e "${RED}❌ Missing required environment variables:${NC}"
        for secret in "${missing_secrets[@]}"; do
            echo -e "${RED}   - $secret${NC}"
        done
        echo -e "${YELLOW}💡 Please add these variables to your .env file${NC}"
        return 1
    fi
    
    return 0
}

# Main execution
main() {
    echo -e "${BLUE}📋 Reading environment variables from .env...${NC}"
    
    # Read .env file
    read_env_file
    
    # Validate required secrets
    if ! validate_secrets; then
        exit 1
    fi
    
    echo -e "${GREEN}✅ Environment variables loaded successfully${NC}"
    echo ""
    
    echo -e "${BLUE}🔐 Setting up GitHub Secrets...${NC}"
    echo "Repository: $REPO_NAME"
    echo ""
    
    # Core integration secrets
    echo -e "${BLUE}Core Integration Secrets:${NC}"
    set_github_secret "HUBSPOT_API_KEY" "$HUBSPOT_API_KEY"
    set_github_secret "SLACK_WEBHOOK_URL" "$SLACK_WEBHOOK_URL"
    
    # Optional secrets (won't fail if missing)
    echo ""
    echo -e "${BLUE}Optional Secrets:${NC}"
    set_github_secret "SLACK_BOT_TOKEN" "$SLACK_BOT_TOKEN" || true
    set_github_secret "SLACK_SIGNING_SECRET" "$SLACK_SIGNING_SECRET" || true
    set_github_secret "ZAPIER_WEBHOOK_URL" "$ZAPIER_WEBHOOK_URL" || true
    
    # Deployment secrets
    echo ""
    echo -e "${BLUE}Deployment Secrets:${NC}"
    set_github_secret "VERCEL_TOKEN" "$VERCEL_TOKEN" || true
    set_github_secret "VERCEL_ORG_ID" "$VERCEL_ORG_ID" || true
    set_github_secret "VERCEL_PROJECT_ID" "$VERCEL_PROJECT_ID" || true
    
    # Slack notification channels
    echo ""
    echo -e "${BLUE}Slack Channel Configuration:${NC}"
    set_github_secret "SLACK_TEST_CHANNEL" "${SLACK_TEST_CHANNEL:-#kopp-crm-tests}" || true
    set_github_secret "SLACK_QA_CHANNEL" "${SLACK_QA_CHANNEL:-#kopp-crm-qa}" || true
    set_github_secret "SLACK_RELEASE_CHANNEL" "${SLACK_RELEASE_CHANNEL:-#anuncios-kopp}" || true
    set_github_secret "SLACK_DEV_CHANNEL" "${SLACK_DEV_CHANNEL:-#equipo-dev}" || true
    
    echo ""
    echo -e "${GREEN}🎉 GitHub Secrets setup completed!${NC}"
    echo ""
    
    # Verify secrets were set
    echo -e "${BLUE}🔍 Verifying secrets...${NC}"
    if gh secret list --repo="$REPO_NAME" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Secrets verification successful${NC}"
        echo ""
        echo -e "${BLUE}📋 Currently configured secrets:${NC}"
        gh secret list --repo="$REPO_NAME" | head -10
    else
        echo -e "${YELLOW}⚠️  Could not verify secrets (this is normal for some repos)${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}🚀 Next Steps:${NC}"
    echo "1. Check your GitHub repository secrets at:"
    echo "   https://github.com/$REPO_NAME/settings/secrets/actions"
    echo ""
    echo "2. Push your code to trigger the CI workflow:"
    echo "   git add ."
    echo "   git commit -m \"feat: setup GitHub secrets and CI workflow\""
    echo "   git push origin main"
    echo ""
    echo "3. Monitor the workflow at:"
    echo "   https://github.com/$REPO_NAME/actions"
    echo ""
    echo -e "${BLUE}📚 For more information, see:${NC}"
    echo "   - docs/QA-TESTING-RELEASES-GUIDE.md"
    echo "   - .github/workflows/ci.yml"
}

# Help function
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Setup GitHub Secrets for Kopp CRM Automation"
    echo ""
    echo "OPTIONS:"
    echo "  -h, --help     Show this help message"
    echo "  -v, --verify   Only verify current secrets (don't set new ones)"
    echo "  -l, --list     List current secrets"
    echo ""
    echo "REQUIREMENTS:"
    echo "  - .env file with required variables"
    echo "  - GitHub CLI (gh) installed and authenticated"
    echo "  - Proper repository access permissions"
    echo ""
    echo "EXAMPLES:"
    echo "  $0                 # Setup all secrets from .env"
    echo "  $0 --verify        # Only verify existing secrets"
    echo "  $0 --list          # List current secrets"
}

# Parse command line arguments
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    -v|--verify)
        echo -e "${BLUE}🔍 Verifying GitHub Secrets...${NC}"
        if gh secret list --repo="$REPO_NAME" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Secrets accessible${NC}"
            gh secret list --repo="$REPO_NAME"
        else
            echo -e "${RED}❌ Cannot access secrets${NC}"
            exit 1
        fi
        exit 0
        ;;
    -l|--list)
        echo -e "${BLUE}📋 Current GitHub Secrets:${NC}"
        gh secret list --repo="$REPO_NAME"
        exit 0
        ;;
    "")
        # No arguments, run main function
        main
        ;;
    *)
        echo -e "${RED}❌ Unknown option: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac
