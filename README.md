# Banno Example

I've chosen to implement this in end-to-end Javascript using a microservices 
design with Consul for service discovery. Each Docker image uses Alpine Linux 
and S6 as an init system, making them very small and very performant. 

The `consumer` application in this repository persists aggregations of each 
individual tweet to RethinkDB. A streaming RethinkDB query routes updated 
statistics to front end nodes via Socket.io.

The `web` directory contains a single page web application using D3 and Cubism, 
which is compiled using Brunch and Bower.

You can check out the source to my Docker images at:

https://github.com/hypoalex/docker-images

## Note!

This really doesn't actually work at the moment. I keep iterating on the thing, 
and once I reached this point of "I should rewrite it using Koa and pure ES6!" I
realized that I probably shouldn't spend too much more time on it.

So, this isn't exactly my best work but it's the architecture and approach I'd 
be using if I actually wanted to build something to consume the entire Twitter 
feed. The idea was to do a streaming map/reduce query via RethinkDB that gets 
pushed out to the clients via socketio. Note the distinction between web/app/client and web/app/server! 

https://github.com/hypoalex/html-minifier-brunch - HTML minification is 
provided by this brunch plugin.

## Trying It Out

This is fairly easy. Provided you have Docker installed on your machine, you 
can just do:

    docker-compose up    

And then browse to http://localhost:4000/ but note that it doesn't actually 
work at the moment. Maybe we can hack on it a bit if you're interested?

## Development Notes

For development, this could be much better. I currently have a separate Linux 
box running Docker and I set `DOCKER_HOST` manually, but if I were running 
Docker Machine on my laptop I could make it much more streamlined. This is 
really just a sort of outline of a web scale application.

## Production Notes

This is designed to be used with Joyent Triton, which exposes an entire 
datacenter as a single `DOCKER_HOST`. Using this model, `docker-compose` is a
much more powerful tool than it is on, say, AWS. Each image is provisioned on 
the bare metal without any virtual machines. While this will work with any 
`DOCKER_HOST`, if you can imagine using Triton I think you'll see the benefit.

For a production system, it's likely that you would want to do authentication 
for the client with Json Web Tokens, but this iteration doesn't have any sort 
of auth. It would also be easy to have multiple instances of the web app being
load balanced by HAProxy. 

Logging could be done better, e.g., with prometheus. This currently uses one 
consul instance, which is not at all ideal for production workloads. You'd want 
to have a master and at least two slave leaders. Several of the init scripts 
could be cleaned up a bit to use S6 more effectively. 

**These images are not currently optimized for size.**

There is a bit of bloat that could be removed, but it's still pretty minimal.