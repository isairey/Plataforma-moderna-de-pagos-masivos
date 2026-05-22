<div align="center">

<img width="180" src="https://cdn-icons-png.flaticon.com/512/2620/2620277.png" />

# 🤝 Contributing to Stellar BatchPay

### Guía oficial de contribución para desarrolladores y colaboradores 🚀

<p align="center">
  <b>Stellar BatchPay</b> es un proyecto open source enfocado en pagos masivos blockchain, smart contracts Soroban y automatización financiera sobre Stellar.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Open_Source-Contributions-7B61FF?style=for-the-badge&logo=github&logoColor=white">
  <img src="https://img.shields.io/badge/Stellar-Blockchain-000000?style=for-the-badge&logo=stellar&logoColor=white">
  <img src="https://img.shields.io/badge/Soroban-Smart_Contracts-FF6F00?style=for-the-badge&logo=rust&logoColor=white">
  <img src="https://img.shields.io/badge/Next.js-Fullstack_App-111111?style=for-the-badge&logo=nextdotjs&logoColor=white">
</p>

<p align="center">
  <a href="#-requisitos">Requisitos</a> •
  <a href="#-instalación-local">Instalación</a> •
  <a href="#-arquitectura">Arquitectura</a> •
  <a href="#-testing">Testing</a> •
  <a href="#-pull-requests">Pull Requests</a>
</p>

</div>

---

# 🌌 Acerca de las contribuciones

Gracias por interesarte en contribuir a **Stellar BatchPay** ❤️

Este proyecto busca construir una plataforma moderna para:

- 💸 Pagos masivos en Stellar
- ⏳ Sistemas de vesting
- 🌐 Integraciones blockchain
- ⚡ Automatización financiera
- 🧩 Smart contracts Soroban
- 🚀 Arquitectura escalable

Las contribuciones pueden incluir:

- 🛠️ Nuevas funcionalidades
- 🐛 Corrección de errores
- 📚 Mejoras de documentación
- ⚡ Optimización de rendimiento
- 🔒 Mejoras de seguridad
- 🎨 Mejoras UI/UX

---

# 📋 Requisitos

## ⚙️ Herramientas necesarias

Antes de comenzar asegúrate de tener instalado:

- Node.js 20+
- npm 10+
- Rust Toolchain
- Soroban CLI
- Git
- VS Code (recomendado)

---

## 🦀 Configuración Rust

Instalar target WASM:

```bash
rustup target add wasm32-unknown-unknown
```

---

## 🌐 Instalar Soroban CLI

```bash
cargo install --locked soroban-cli
```

---

# ⚡ Instalación local

## 1️⃣ Clonar repositorio

```bash
git clone https://github.com/isairey/Plataforma-moderna-de-pagos-masivos.git
```

---

## 2️⃣ Entrar al proyecto

```bash
cd Plataforma-moderna-de-pagos-masivos
```

---

## 3️⃣ Configurar upstream

```bash
git remote add upstream https://github.com/isairey/Plataforma-moderna-de-pagos-masivos.git
```

---

## 4️⃣ Instalar dependencias

```bash
npm install
```

---

## 5️⃣ Ejecutar entorno local

```bash
npm run dev
```

La aplicación estará disponible en:

```bash
http://localhost:3000
```

---

# 🏗️ Arquitectura

## ⚡ Arquitectura general

```text
Frontend → API Routes → Stellar SDK → Stellar Network
                          ↓
                   Soroban Contracts
```

---

# 📂 Estructura del proyecto

```bash
Plataforma-moderna-de-pagos-masivos/
│
├── app/
├── components/
├── lib/
│   └── stellar/
├── contracts/
│   └── batch-vesting/
├── tests/
├── public/
├── docs/
├── README.md
├── CONTRIBUTING.md
└── LICENSE
```

---

# 👨‍💻 Módulos principales

## 🌐 App Module (`app/`)

Contiene las páginas y rutas API de Next.js.

### Funcionalidades:

- 📄 App Router
- 🌐 API Routes
- ⚡ Batch Builder API
- 🔗 Integración frontend/backend

---

## 🎨 Components Module (`components/`)

Componentes reutilizables de UI.

### Funcionalidades:

- 📂 File Upload
- 📊 Batch Summary
- 📋 Result Display
- ⚡ Interfaces dinámicas

---

## ⭐ Stellar Core Module (`lib/stellar/`)

Motor principal de procesamiento blockchain.

### Funcionalidades:

- 📄 Parsing CSV/JSON
- 🔍 Validación de pagos
- 📦 Batching automático
- 🌐 Construcción de transacciones
- ⚡ Integración Stellar SDK

---

## ⏳ Smart Contract Module (`contracts/batch-vesting/`)

Contratos inteligentes Soroban.

### Funcionalidades:

- 🔒 Batch Vesting
- ⏰ Unlock timestamps
- 💰 Custodia de fondos
- 📋 Claims automáticos

---

# 🧠 Archivos importantes

| Archivo | Descripción |
|---|---|
| `parser.ts` | Conversión CSV/JSON |
| `validator.ts` | Validación de pagos |
| `batcher.ts` | Agrupación de transacciones |
| `route.ts` | API de batch builder |
| `lib.rs` | Smart contract Soroban |

---

# 🧪 Testing

## ⚡ Ejecutar tests JavaScript/TypeScript

```bash
npm test
```

---

## 🏗️ Build de producción

```bash
npm run build
```

---

## 🦀 Ejecutar tests Soroban

```bash
cargo test --manifest-path contracts/Cargo.toml
```

---

## ⚙️ Compilar contratos WASM

```bash
cargo build --manifest-path contracts/Cargo.toml --target wasm32-unknown-unknown
```

---

# 🔐 Buenas prácticas

## ✅ Antes de abrir un Pull Request

Asegúrate de:

- ✔️ Ejecutar tests locales
- ✔️ Verificar build de producción
- ✔️ Actualizar documentación
- ✔️ Mantener commits limpios
- ✔️ Probar contratos Soroban
- ✔️ Revisar errores TypeScript

---

# 🚀 Workflow de desarrollo

## 🌱 Crear nueva rama

```bash
git checkout -b feature/nueva-funcionalidad
```

---

## 💾 Realizar commit

```bash
git commit -m "✨ Nueva funcionalidad"
```

---

## 📤 Push al fork

```bash
git push origin feature/nueva-funcionalidad
```

---

## 🔄 Crear Pull Request

Abrir Pull Request hacia:

```bash
main
```

---

# 🤝 Pull Request Guidelines

## 📋 Recomendaciones

- Mantener PRs pequeños y específicos
- No mezclar refactors con fixes
- Agregar pruebas para nuevos cambios
- Actualizar documentación relevante
- Referenciar issues relacionados
- Mantener consistencia del proyecto

---

# 🧠 Commit Guidelines

## ✨ Commits recomendados

```bash
✨ Nueva funcionalidad
🐛 Corrección de bug
🛠️ Refactor interno
📚 Actualización documentación
⚡ Optimización
🔒 Seguridad
```

---

# 🐛 Reportar problemas

## 📋 Información recomendada

Cuando abras un Issue incluye:

- ✅ Comportamiento esperado
- ❌ Resultado actual
- 🔄 Pasos para reproducir
- 📸 Screenshots
- 📄 Logs
- ⚡ Error output

---

# 🌐 Tecnologías utilizadas

## ⚙️ Stack principal

<p>
  <img src="https://skillicons.dev/icons?i=nextjs,react,ts,nodejs,rust,git,github,vscode" />
</p>

- Next.js
- React
- TypeScript
- Node.js
- Rust
- Soroban SDK
- Stellar SDK
- Git & GitHub

---

# 🚧 Roadmap de contribución

## 🔮 Áreas abiertas

- 📱 Mobile support
- 🌐 Wallet integrations
- 🤖 Smart automation
- 📊 Analytics dashboard
- ⚡ Performance improvements
- 🔒 Security hardening
- ☁️ Cloud deployment
- 🌍 Multi-chain support

---



# 🌟 Cómo apoyar el proyecto

⭐ Dale una estrella  
🍴 Haz fork  
📢 Comparte el proyecto  
🧩 Contribuye con código

---

# 📜 Licencia

Proyecto open source enfocado en blockchain, automatización financiera y smart contracts modernos.

---

<div align="center">

### 🌌 Stellar BatchPay Contributors — construyendo pagos blockchain modernos ⚡

</div>
