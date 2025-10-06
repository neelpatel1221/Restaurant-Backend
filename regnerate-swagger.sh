# Re Generates the client library in the frontend project

java -jar ./openapi-generator-cli.jar generate -i ./src/public/swagger/swagger.yaml -l typescript-angular -o ../zhylar-frontend/src/swagger --additional-properties ngVersion=17.0,providedInRoot=true,supportsES6=true,modelPropertyNaming=original
cd ../zhylar-frontend
./sanitize-swagger.sh
