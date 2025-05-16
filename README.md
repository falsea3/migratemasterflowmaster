# 🚀 MigrateMasterFlowMaster

Добро пожаловать в **MigrateMasterFlowMaster** — удобный и надёжный инструмент миграции данных между базами с использованием **Node.js** и **Prisma ORM**.

---

## 📦 Описание

**MigrateMasterFlowMaster** — это модульный и расширяемый инструмент для миграции данных из старой базы данных в новую, соответствующую обновлённой бизнес-логике.  
Он обеспечивает:

- 🔄 Последовательный и контролируемый перенос данных
- ✅ Валидацию соответствий между схемами
- 💥 Отчёты об ошибках и пропущенных данных
- 🧩 Гибкую архитектуру для адаптации под разные модели

---

## ⚙️ Установка

1. Установите зависимости:

   ```bash
   npm install
   ```

2. Настройте `.env` файл:

   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/dbname?schema=public
   LEGACY_DATABASE_URL=postgresql://user:password@localhost:5432/dbname?schema=public
   ```

2. Сгенерируйте Prisma-клиенты для старой и новой схем:

```bash
npx prisma generate --schema=prisma/old/schema.prisma
npx prisma generate --schema=prisma/new/schema.prisma
```