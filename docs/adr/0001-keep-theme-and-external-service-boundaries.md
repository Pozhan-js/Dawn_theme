# Keep Theme and External Service Boundaries Separate

This repository is treated as a Shopify **Theme Repository**: it may contain `frontend/` source code for building theme assets, but the Shopify deployable remains the theme runtime files and built assets. The Nest backend is only a proof-of-concept **External Service Layer** and should move to a separate app or service repository for a production implementation, because Shopify themes cannot run backend code and theme pushes must not upload service source.
