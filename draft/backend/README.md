## Sync Database With Docker
### Push Routine
1. before add data into db, spin up the container: 
`
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStrong!Pass123" -p 1433:1433 --name <local-container-name> -d wenghong107/fyp-sqlserver:with-data
`
2. add data
3. `docker stop <local-container-name>`
4. `docker commit <local-container-name> wenghong107/fyp-sqlserver:with-data`
5. `docker push wenghong107/fyp-sqlserver:with-data`

### Pull Routine
1. stop and delete local container
2. `docker pull wenghong107/fyp-sqlserver:with-data`
3. spin up the container: `docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStrong!Pass123" -p 1433:1433 --name <local-container-name> -d wenghong107/fyp-sqlserver:with-data`
4. connect DBeaver

---IF WISH TO RUN CONTAINER USING DOCKER COMPOSE---
1. delete the container manually that is specified in the docker-compose.yml
2. `docker pull wenghong107/fyp-sqlserver:with-data`
3. at terminal cd to backend
4. `docker-compose up -d`