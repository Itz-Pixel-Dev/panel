#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'
BOLD='\033[1m'

# Clear screen
clear

# ASCII Art Logo
echo -e "${BLUE}"
cat << "EOF"
    _    _      _ _       _    
   / \  (_)_ __| (_)_ __ | | __
  / _ \ | | '__| | | '_ \| |/ /
 / ___ \| | |  | | | | | |   < 
/_/   \_\_|_|  |_|_|_| |_|_|\_\
                                
 ____                  _ 
|  _ \ __ _ _ __   ___| |
| |_) / _` | '_ \ / _ \ |
|  __/ (_| | | | |  __/ |
|_|   \__,_|_| |_|\___|_|
                         
EOF
echo -e "${NC}"

echo -e "${BOLD}Welcome to AirLink Panel Installation Script${NC}\n"
echo -e "${YELLOW}⚠️  This script will install AirLink Panel on your system.${NC}\n"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root${NC}"
    exit
fi

# Function to show spinner
spinner() {
    local pid=$1
    local delay=0.1
    local spinstr='|/-\'
    while [ "$(ps a | awk '{print $1}' | grep $pid)" ]; do
        local temp=${spinstr#?}
        printf " [%c]  " "$spinstr"
        local spinstr=$temp${spinstr%"$temp"}
        sleep $delay
        printf "\b\b\b\b\b\b"
    done
    printf "    \b\b\b\b"
}

# Confirmation prompt
echo -e "${BOLD}Do you want to continue with the installation? (y/n)${NC}"
read -p "> " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Installation cancelled.${NC}"
    exit 1
fi

# Terms and Conditions
echo -e "\n${BOLD}Terms and Conditions${NC}"
echo -e "${YELLOW}================================${NC}"
echo "1. This software is provided under the MIT License."
echo "2. You are responsible for maintaining the security of your installation."
echo "3. The developers are not liable for any damages or losses."
echo -e "\n${BOLD}Do you accept the terms and conditions? (y/n)${NC}"
read -p "> " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Installation cancelled.${NC}"
    exit 1
fi

# Privacy Policy
echo -e "\n${BOLD}Privacy Policy${NC}"
echo -e "${YELLOW}================================${NC}"
echo "1. We collect minimal system information for installation."
echo "2. No personal data is transmitted without consent."
echo "3. Server logs are maintained for security purposes."
echo -e "\n${BOLD}Do you accept the privacy policy? (y/n)${NC}"
read -p "> " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Installation cancelled.${NC}"
    exit 1
fi

# Check Prerequisites
echo -e "\n${BOLD}Checking Prerequisites...${NC}"
echo -e "${YELLOW}================================${NC}"

# Check Node.js
echo -n "Checking Node.js... "
if command -v node >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo "Please install Node.js v16 or higher"
    exit 1
fi

# Check npm
echo -n "Checking npm... "
if command -v npm >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo "Please install npm v8 or higher"
    exit 1
fi

# Check Git
echo -n "Checking Git... "
if command -v git >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo "Please install Git"
    exit 1
fi

# Installation Process
echo -e "\n${BOLD}Starting Installation...${NC}"
echo -e "${YELLOW}================================${NC}"

# Clone Repository
echo -e "\n${BOLD}[1/6]${NC} Cloning repository..."
cd /var/www/
git clone https://github.com/AirlinkLabs/panel.git panel > /dev/null 2>&1 &
spinner $!
echo -e "${GREEN}✓${NC} Repository cloned"

# Set Permissions
echo -e "\n${BOLD}[2/6]${NC} Setting permissions..."
chown -R www-data:www-data /var/www/panel
chmod -R 755 /var/www/panel
echo -e "${GREEN}✓${NC} Permissions set"

# Install Dependencies
echo -e "\n${BOLD}[3/6]${NC} Installing TypeScript globally..."
npm install -g typescript > /dev/null 2>&1 &
spinner $!
echo -e "${GREEN}✓${NC} TypeScript installed"

echo -e "\n${BOLD}[4/6]${NC} Installing project dependencies..."
cd panel
npm install --production > /dev/null 2>&1 &
spinner $!
echo -e "${GREEN}✓${NC} Dependencies installed"

# Database Migration
echo -e "\n${BOLD}[5/6]${NC} Running database migrations..."
npm run migrate:dev > /dev/null 2>&1 &
spinner $!
echo -e "${GREEN}✓${NC} Database migrations complete"

# Build Application
echo -e "\n${BOLD}[6/6]${NC} Building application..."
npm run build-ts > /dev/null 2>&1 &
spinner $!
echo -e "${GREEN}✓${NC} Build complete"

# Installation Complete
echo -e "\n${GREEN}${BOLD}Installation Complete! 🎉${NC}"
echo -e "${YELLOW}================================${NC}"
echo -e "\nTo start the application, run:"
echo -e "${BLUE}cd /var/www/panel && npm run start${NC}"
echo -e "\nFor PM2 deployment, run:"
echo -e "${BLUE}npm install pm2 -g${NC}"
echo -e "${BLUE}pm2 start dist/app.js --name \"panel\"${NC}"
echo -e "${BLUE}pm2 save${NC}"
echo -e "${BLUE}pm2 startup${NC}"

echo -e "\n${BOLD}Thank you for installing AirLink Panel!${NC}"
echo -e "Join our Discord community: ${BLUE}https://discord.gg/D8YbT9rDqz${NC}"
echo -e "\n${YELLOW}Made with ❤️  by AirLink Labs${NC}\n"