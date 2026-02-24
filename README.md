# Usage

**Important:**

- The source of truth is inside the main repository: https://github.com/mint-vernetzt/community-platform
- Don't migrate the database from here
- If schema changes, copy it from the main directory into "prisma/schema.prisma" and run "npm run prisma:generate"
- If modules used by the api change copy them from the main repository into "src/cp-modules"
- Dev environment: Start the local dev containers (docker) from the main repository to make api work.
