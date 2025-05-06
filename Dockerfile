# Используем многоэтапную сборку для оптимизации размера образа
# Этап сборки
FROM oven/bun:1.1.0 AS builder

WORKDIR /app

# Копируем файлы для установки зависимостей
COPY package.json bun.lockb ./

# Устанавливаем зависимости
RUN bun install --frozen-lockfile

# Копируем исходный код
COPY . .

# Проверяем типы и линтер
RUN bun run type-check && bun run lint

# Запускаем тесты
RUN bun run test

# Создаем production-сборку
RUN bun run build

# Этап запуска
FROM oven/bun:1.1.0 AS runner
WORKDIR /app

ENV NODE_ENV production

# Создаем непривилегированного пользователя
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Копируем необходимые файлы из этапа сборки
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Устанавливаем владельца файлов
RUN chown -R nextjs:nodejs /app

# Используем непривилегированного пользователя
USER nextjs

# Открываем порт
EXPOSE 3000

# Проверка здоровья приложения
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Запускаем приложение
CMD ["bun", "run", "server.js"]
