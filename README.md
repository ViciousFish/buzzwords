# Buzzwords.gg

"Scrabble meets Go" - a hexagonal word game about strategically taking territory

### [gameplay demo](https://twitter.com/BuzzwordsGG/status/1476286068898996225?s=20)

## Follow our twitter for updates

https://twitter.com/BuzzwordsGG


## Running the code for development

1. create a file `client/.env` with the contents
```
VITE_API_PREFIX=http://localhost:8080/api
VITE_SOCKET_URL=http://localhost:8080
```
2. run `yarn` in this folder
3. run `yarn dev` in `./server`
4. simultaneously, run `yarn dev` in `./client`
5. go to http://localhost:3000 in your browser

By default, the server stores all its data in memory only. To use mongo, drop a .env file in `./server` with 
```
DB_TYPE=mongo
MONGO_URL=<your connection string>
```

Because we're using transactions, your mongo must be a replica set


## Running the code in production

For now, production is dockerized with docker compose. `docker-compose build` or `docker-compose pull`, then `docker-compose up`.
You'll need a .env file in this folder with just the MONGO_URL
