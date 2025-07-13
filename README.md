# RPG Battle - ICP Smart Contract Game

**RPG Battle** adalah sebuah game RPG berbasis smart contract yang dibangun di Internet Computer Protocol (ICP) menggunakan ICP Ninja. Proyek ini menggabungkan gameplay RPG klasik dengan teknologi blockchain untuk menciptakan pengalaman gaming yang terdesentralisasi.

## 🎮 Fitur Utama

- **Battle System**: Sistem pertarungan RPG dengan mekanisme turn-based
- **Character Management**: Pengelolaan karakter dengan stats dan kemampuan
- **Smart Contract Integration**: Semua game logic berjalan di ICP blockchain
- **AI-Powered Interactions**: Integrasi dengan Large Language Model (LLM) untuk pengalaman yang lebih interaktif
- **Decentralized Gaming**: Gameplay yang sepenuhnya terdesentralisasi di Internet Computer

## 🚀 Teknologi yang Digunakan

- **Internet Computer Protocol (ICP)**: Platform blockchain untuk smart contracts
- **ICP Ninja**: Web-based IDE untuk development
- **Motoko/Rust**: Bahasa pemrograman untuk smart contracts
- **Ollama**: Server untuk menjalankan LLM secara lokal
- **dfx**: DFINITY command-line tool untuk deployment

## 📋 Persyaratan Sistem

### Untuk Development Lokal

1. **Node.js** (versi 16 atau lebih baru)
2. **DFINITY Canister SDK (dfx)**
3. **Ollama** untuk menjalankan LLM lokal
4. **Git** untuk version control

### Untuk Testing dengan LLM

1. **Ollama** terinstall di sistem
2. Model **llama3.1:8b** (sekitar 4GB)
3. Port 11434 tersedia untuk Ollama server

## 🛠️ Instalasi dan Setup

### 1. Clone Repository

```bash
git clone https://github.com/qynd/RPGBattle.git
cd RPGBattle
```

### 2. Setup Ollama (untuk testing lokal)

```bash
# Install Ollama terlebih dahulu dari https://ollama.com/

# Jalankan server Ollama
ollama serve

# Download model LLM (di terminal terpisah)
ollama run llama3.1:8b
```

### 3. Deploy ke Internet Computer

```bash
# Start dfx local network
dfx start --background --clean

# Deploy smart contract
dfx deploy
```

## 🎯 Cara Bermain

1. **Mulai Game**: Akses aplikasi melalui browser setelah deployment
2. **Buat Karakter**: Customize karakter RPG Anda
3. **Enter Battle**: Masuki mode pertarungan
4. **Strategic Combat**: Gunakan strategi untuk mengalahkan musuh
5. **Progression**: Tingkatkan karakter dan unlock kemampuan baru

## 🌐 Deployment di ICP Ninja

### Quick Deploy (Recommended)

1. Buka proyek di [ICP Ninja](https://icp.ninja)
2. Klik tombol **"Run"** di pojok kanan atas
3. Aplikasi akan otomatis di-deploy ke ICP mainnet secara gratis

### Manual Deployment

```bash
# Download project files dari ICP Ninja
# atau clone dari GitHub

# Setup local environment
dfx start --background --clean
dfx deploy

# Untuk production deployment
dfx deploy --network ic
```

## 📁 Struktur Proyek

```
RPGBattle/
├── src/
│   ├── backend/          # Smart contract logic
│   ├── frontend/         # User interface
│   └── shared/           # Shared utilities
├── .dfx/                 # dfx configuration
├── dfx.json             # DFINITY configuration
├── package.json         # Node.js dependencies
└── README.md           # This file
```

## 🔧 Konfigurasi

### dfx.json
File konfigurasi utama untuk deployment di Internet Computer

### Environment Variables
```bash
# Untuk development
OLLAMA_SERVER=http://localhost:11434
DFX_NETWORK=local

# Untuk production
DFX_NETWORK=ic
```

## 🧪 Testing

```bash
# Run unit tests
npm test

# Test smart contract
dfx test

# Integration testing
npm run test:integration
```

## 🚀 Deployment Options

### 1. ICP Ninja (Recommended)
- **Pros**: Mudah, cepat, gratis
- **Cons**: Terbatas untuk development

### 2. Local Development
- **Pros**: Full control, debugging
- **Cons**: Membutuhkan setup yang lebih kompleks

### 3. Production Deployment
- **Pros**: Permanent, scalable
- **Cons**: Membutuhkan cycles untuk maintenance

## 🛡️ Keamanan

Proyek ini mengikuti [security best practices](https://internetcomputer.org/docs/building-apps/security/overview) untuk development di ICP:

- Input validation untuk semua user interactions
- Safe arithmetic operations
- Proper access control
- Regular security audits

## 🤝 Kontribusi

Kami menyambut kontribusi dari komunitas! Berikut cara berkontribusi:

1. Fork repository ini
2. Buat branch feature baru (`git checkout -b feature/amazing-feature`)
3. Commit perubahan (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Buat Pull Request

## 📝 Changelog

### v1.0.0
- Initial release dengan basic RPG battle system
- Integrasi dengan LLM untuk AI interactions
- Deployment di ICP mainnet

## 🐛 Bug Reports

Jika Anda menemukan bug, silakan buat issue di GitHub dengan detail:
- Langkah untuk reproduce
- Expected vs actual behavior
- Screenshots (jika applicable)
- Environment details

## 📚 Resources

- [ICP Ninja Documentation](https://icp.ninja)
- [Internet Computer Documentation](https://internetcomputer.org/docs)
- [DFINITY Developer Portal](https://dfinity.org/developers)
- [Ollama Documentation](https://ollama.com/)

## 📄 License

Proyek ini dilisensikan under MIT License - lihat file [LICENSE](LICENSE) untuk detail.

## 👥 Tim Pengembang

- **Developer**: [@qynd](https://github.com/qynd)
- **Platform**: ICP Ninja
- **Blockchain**: Internet Computer

## 📞 Kontak

- **GitHub**: [qynd/RPGBattle](https://github.com/qynd/RPGBattle)
- **Issues**: Gunakan GitHub Issues untuk bug reports dan feature requests

---

**Dibuat dengan ❤️ menggunakan ICP Ninja dan Internet Computer**

*Selamat bermain dan berkontribusi untuk masa depan gaming yang terdesentralisasi!*
