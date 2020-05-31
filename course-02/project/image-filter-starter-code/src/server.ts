import express from 'express';
import fs = require('fs');
import { isUri } from 'valid-url';
import { Request, Response } from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // GET /filteredimage?image_url={{URL}}
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file
  app.get("/filteredimage", async (req: Request, res: Response) => {
    // validate image_url query
    let { image_url } = req.query;

    if (!image_url || image_url.length == 0) {
      return res.status(400).send("Must provide an image URL.");
    }

    if (!isUri(image_url)) {
      return res.status(422).send("Not a valid URI");
    }

    const filteredImagePath = await filterImageFromURL(image_url);
    res.sendFile(filteredImagePath, (err) => {
      if(err) {
        console.log('Error: ' + err.message);
      }
      
      if (fs.existsSync(filteredImagePath)) {
        deleteLocalFiles([filteredImagePath]);
      }
    });
  });
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();