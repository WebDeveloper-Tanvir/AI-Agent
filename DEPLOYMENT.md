# Deployment Guide

This guide covers deploying the AI UI Generator to various platforms.

## Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications.

### Steps:

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo>
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables:
     - `ANTHROPIC_API_KEY`: Your API key

3. **Deploy:**
   - Click "Deploy"
   - Vercel will automatically build and deploy
   - You'll get a public URL

### Automatic Deployments:
- Every push to `main` triggers a new deployment
- Pull requests get preview deployments

## Netlify

1. **Build Settings:**
   - Build command: `npm run build`
   - Publish directory: `.next`

2. **Environment Variables:**
   - Add `ANTHROPIC_API_KEY` in site settings

3. **Deploy:**
   - Connect GitHub repository
   - Netlify will handle the rest

## Railway

1. **Create New Project:**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"

2. **Configure:**
   - Add `ANTHROPIC_API_KEY` environment variable
   - Railway auto-detects Next.js

3. **Deploy:**
   - Automatic deployment on push

## Docker (Self-Hosted)

1. **Create Dockerfile:**
   ```dockerfile
   FROM node:18-alpine AS base
   
   # Install dependencies only when needed
   FROM base AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app
   
   COPY package.json package-lock.json ./
   RUN npm ci
   
   # Rebuild the source code only when needed
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   
   RUN npm run build
   
   # Production image
   FROM base AS runner
   WORKDIR /app
   
   ENV NODE_ENV production
   
   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs
   
   COPY --from=builder /app/public ./public
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
   
   USER nextjs
   
   EXPOSE 3000
   
   ENV PORT 3000
   
   CMD ["node", "server.js"]
   ```

2. **Build and Run:**
   ```bash
   docker build -t ai-ui-generator .
   docker run -p 3000:3000 -e ANTHROPIC_API_KEY=your_key ai-ui-generator
   ```

## Environment Variables

All platforms need:
```
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

## Production Checklist

Before deploying:

- [ ] Set `ANTHROPIC_API_KEY` environment variable
- [ ] Test build locally: `npm run build && npm start`
- [ ] Update `.env.example` with any new variables
- [ ] Verify all API routes work
- [ ] Check error handling
- [ ] Test on mobile devices
- [ ] Review security settings

## Post-Deployment

1. **Test the deployed app:**
   - Try generating a UI
   - Test iterative modifications
   - Verify rollback works
   - Check error handling

2. **Monitor:**
   - Check logs for errors
   - Monitor API usage
   - Track performance

3. **Set up analytics (optional):**
   - Vercel Analytics
   - Google Analytics
   - Custom tracking

## Troubleshooting

### Build Fails
- Check Node.js version (18+)
- Verify all dependencies are in `package.json`
- Check TypeScript errors: `npx tsc --noEmit`

### API Errors
- Verify `ANTHROPIC_API_KEY` is set
- Check API key has sufficient credits
- Review API rate limits

### Preview Not Working
- Check browser console for errors
- Verify component imports
- Test with simple UI first

## Scaling Considerations

For production use:

1. **Rate Limiting:**
   - Implement API rate limits
   - Add request throttling
   - Use caching where possible

2. **Authentication:**
   - Add user authentication
   - Protect API routes
   - Implement usage quotas

3. **Database:**
   - Persist user sessions
   - Store generation history
   - Enable project management

4. **Monitoring:**
   - Set up error tracking (Sentry)
   - Monitor performance (Vercel Analytics)
   - Track API usage

## Support

For deployment issues:
- Check platform documentation
- Review build logs
- Test locally first
- Verify environment variables
