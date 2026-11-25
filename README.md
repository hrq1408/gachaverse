# GachaVerse

Portal brasileiro de jogos gacha com Next.js, TypeScript, Tailwind CSS e App Router. O catálogo inicial cobre Honkai: Star Rail, Genshin Impact, Zenless Zone Zero e Wuthering Waves.

## Desenvolvimento

Requisitos: Node.js 22 ou superior e a versão do pnpm indicada em `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm lint
pnpm test
pnpm build
```

Abra http://localhost:3000 para navegar em desenvolvimento. A exportação estática fica em `out/`.

## Cloudflare Pages

Configure `pnpm build` como comando de build e `out` como diretório de saída. Use a raiz do repositório e Node.js 24 no ambiente de build. Defina `SITE_URL` com a origem HTTPS pública de produção para gerar URLs canônicas e um sitemap populado. Deixe essa variável ausente em previews para que as páginas emitam `noindex`.

Referências: [Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/) e [Next.js Static Exports](https://nextjs.org/docs/app/guides/static-exports).

O catálogo começa com um guia editorial de resgate. Builds e tier lists aguardam revisão. O layout global inclui o script de verificação do AdSense. Os banners permanecem desativados.

## Documentação

- [Instruções de manutenção](AGENTS.md)
- [Arquitetura e fluxo editorial](docs/arquitetura.md)

