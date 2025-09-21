# Setting up the database

In docker-compose.yml set username, password, port to your liking.

After that, in the root of the project create `.env.local` and add this:

`DATABASE_URL=postgres://{user}:{pass}@localhost:{port}/testnest`

Run the PostgreSQL container:

`docker compose up -d`

Insert database:

`docker exec -i testnest-postgres psql -U postgres -d testnest < database.sql`

Insert test values (optional):

`docker exec -i testnest-postgres psql -U postgres -d testnest < db_values.sql`