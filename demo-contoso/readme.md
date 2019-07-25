How to Develop
---
```
npm install
npm run build
npm start
```

How to Dockerfile
---

Replace `0.0.1` with the appropriate version number.
```
az acr login --name identiverse
docker build --rm -f "Dockerfile" -t identiverse.azurecr.io/identiverse-demo-university:0.0.1 .
docker push identiverse.azurecr.io/identiverse-demo-university:0.0.1
```

To run it locally
```
docker run --rm -it -p 8080:8080/tcp identiverse.azurecr.io/identiverse-demo-university:0.0.1
```

To get the webapp to use the new version, navigate to identiverse/identiverse-university App Service, Select "Container settings" under settings, then select "Tag" and choose the appropriate version number.