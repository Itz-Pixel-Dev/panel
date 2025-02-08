<div align="center">

# 🎮 Airlink Panel

**The Next-Generation Game Server Management Platform**

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)

[![License](https://img.shields.io/github/license/AirlinkLabs/panel)](https://github.com/AirlinkLabs/panel/blob/main/LICENSE)
[![Discord](https://img.shields.io/discord/1302020587316707420)](https://discord.gg/D8YbT9rDqz)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

> [!CAUTION]
> AirLink is currently in active development and being used by early adopters. Please wait for the official release version.

</div>

## 🌟 Features

- 🚀 **Quick Deployment**: Set up game servers in minutes
- 🎮 **Multi-Game Support**: Manage servers for various games
- 📊 **Real-Time Monitoring**: Track server performance and player stats
- 🔒 **Secure Architecture**: Built with security best practices
- 🛠 **Customizable**: Extensive configuration options
- 🤝 **Community-Driven**: Open-source and actively maintained

## 📖 Overview

Airlink Panel is an advanced, open-source game server management platform designed to simplify server deployment, monitoring, and administration. Built with modern technologies, it provides a robust solution for both small and large-scale game server hosting.

## 🔧 System Requirements

### Minimum Requirements
- CPU: 2 cores
- RAM: 4GB
- Storage: 20GB SSD
- OS: Ubuntu 20.04+ / Debian 10+

### Software Prerequisites
- Node.js (v16+)
- npm (v8+)
- Git
- PostgreSQL/MySQL

## 💾 Installation

### Quick Start
```bash
cd /var/www/
git clone https://github.com/AirlinkLabs/panel.git
cd panel
```

### Step-by-Step Setup
1. **Set Permissions**
   ```bash
   sudo chown -R www-data:www-data /var/www/panel
   sudo chmod -R 755 /var/www/panel
   ```

2. **Install Dependencies**
   ```bash
   npm install -g typescript
   npm install --production
   ```

3. **Database Setup**
   ```bash
   npm run migrate:dev
   ```

4. **Build & Run**
   ```bash
   npm run build-ts
   npm run start
   ```

### Production Deployment (PM2)
```bash
npm install pm2 -g
pm2 start dist/app.js --name "panel"
pm2 save
pm2 startup
```

## 🔍 Troubleshooting

Common issues and solutions:
- **Database Connection Issues**: Verify database credentials in `.env`
- **Permission Errors**: Ensure correct file permissions
- **Port Conflicts**: Check if port 3000 is available

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write unit tests for new features
- Maintain clean, readable code
- Update documentation

## 📚 Documentation

- [API Documentation](docs/api.md)
- [Configuration Guide](docs/config.md)
- [Deployment Guide](docs/deployment.md)

## 🌐 Community & Support

- [Discord Community](https://discord.gg/D8YbT9rDqz)
- [GitHub Issues](https://github.com/AirlinkLabs/panel/issues)
- [Feature Requests](https://github.com/AirlinkLabs/panel/discussions)

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

<div align="center">
  <sub>Made with ❤️ by AirLink Labs</sub>
  <br>
  <sub>Want to support us? Give us a ⭐️!</sub>
</div>
