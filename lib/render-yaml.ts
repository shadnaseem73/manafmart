// Render.yaml deployment configuration for Blue-Green deployments
export const renderYaml = `
services:
  - type: web
    name: manaf-mart-web
    env: node
    plan: standard
    buildCommand: npm run build
    startCommand: npm run start
    envVars:
      - key: DATABASE_URL
        scope: build,runtime
        sync: false
      - key: NEXT_PUBLIC_SUPABASE_URL
        scope: build,runtime
        sync: false
      - key: NEXT_PUBLIC_SUPABASE_ANON_KEY
        scope: build,runtime
        sync: false
      - key: SUPABASE_SERVICE_ROLE_KEY
        scope: runtime
        sync: false
    autoDeploy: true
    preDeployCommand: npm run migrate
    region: singapore

databases:
  - name: manaf-mart-db
    plan: standard
    ipAllowList: []

redis:
  - name: manaf-mart-cache
    plan: standard
    region: singapore

staticSite:
  - name: manaf-mart-cdn
    buildCommand: npm run build:static
    staticPublishPath: public
    routes:
      - path: /static
        handler: static
      - path: /
        handler: rewrite

notifications:
  - type: email
    enabled: true
    events:
      - deploy_failure
      - deploy_success
`

export default renderYaml
