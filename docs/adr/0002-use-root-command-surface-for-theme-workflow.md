# Use Root Command Surface for Theme Workflow

Theme development commands should be exposed from the repository root so developers can run the storefront workflow without remembering nested package details. The root command surface should orchestrate Shopify theme checks and frontend asset builds, while the Nest proof-of-concept backend remains outside that theme workflow because it is an **External Service Layer** rather than part of the Shopify deployable.
