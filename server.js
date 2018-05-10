/**
 * NPM Module dependencies.
 */
const path = require('path')
const express = require('express');
const trackRoute = express.Router();
const multer = require('multer');

const mongodb = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

/**
 * NodeJS Module dependencies.
 */
const { Readable } = require('stream');

/**
 * Create Express server && Express Router configuration.
 */
const app = express();
app.use('/tracks', trackRoute);

/**
 * Connect Mongo Driver to MongoDB.
 */
let db;
MongoClient.connect('mongodb://gridfsuser:password@localhost:27017/gridfs', (err, client) => {
  if (err) {
    console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
    process.exit(1);
  }
  db = client.db('gridfs');
  db.collection('songs').find({})
  .toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
    
  });
});

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.htm'))
})

app.get('/uploadfilescreen', function(req, res) {
  res.sendFile(path.join(__dirname + '/uploadfile.htm'))
})

/**
 * GET /tracks/:trackID
 */
trackRoute.get('/:trackID', (req, res) => {
  try {
    var trackID = new ObjectID(req.params.trackID);
  } catch(err) {
    return res.status(400).json({ message: "Invalid trackID in URL parameter. Must be a single String of 12 bytes or a string of 24 hex characters" }); 
  }
  res.set('content-type', 'video/mp4');
  res.set('accept-ranges', 'bytes');

  let bucket = new mongodb.GridFSBucket(db, {
    bucketName: 'tracks'
  });

  let downloadStream = bucket.openDownloadStream(trackID);

  downloadStream.on('data', (chunk) => {
    res.write(chunk);
  });

  downloadStream.on('error', () => {
    res.sendStatus(404);
  });

  downloadStream.on('end', () => {
    res.end();
  });
});

/**
 * POST /tracks
 */
trackRoute.post('/', (req, res) => {
  const storage = multer.memoryStorage()
  const upload = multer({ storage: storage});
  upload.single('track')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: "Upload Request Validation Failed" });
    } else if(!req.body.name) {
      return res.status(400).json({ message: "No track name in request body" });
    }
    
    let trackName = req.body.name;
    console.log('trackname',trackName);
    // Covert buffer to Readable Stream
    const readableTrackStream = new Readable();
    readableTrackStream.push(req.file.buffer);
    readableTrackStream.push(null);

    let bucket = new mongodb.GridFSBucket(db, {
      bucketName: 'tracks'
    });

    let uploadStream = bucket.openUploadStream(trackName);
    let id = uploadStream.id;
    readableTrackStream.pipe(uploadStream);

    uploadStream.on('error', () => {
      return res.status(500).json({ message: "Error uploading file" });
    });

    uploadStream.on('finish', () => {
      return res.status(201).json({ message: "File uploaded successfully, stored under Mongo ObjectID: " + id });
    });
  });
});

/**
 * GET /tracks/:trackID
 */
app.get('/tracklist', (req, res) => {
  db.collection('tracks.files').find({})
  .toArray(function(err, result) {
    if (err) {
      throw err; 
    } else {
        console.log(result);
        res.set('content-type', 'application/json');
        res.send(JSON.stringify(result));
    }    
    
  });
  
});

app.get('/delete/:trackID', function (req, res) {
  try {
    var trackID = new ObjectID(req.params.trackID);
  } catch (err) {
    return res.status(400).json({ message: "Invalid trackID in URL parameter. Must be a single String of 12 bytes or a string of 24 hex characters" });
  }

  let bucket = new mongodb.GridFSBucket(db, {
    bucketName: 'tracks'
  });
  bucket.delete(trackID).then(function () {
    return res.status(201).json({ message: "File deleted successfully"});
  });
})

app.get('/deletetracklist', function (req, res) {
  
  let bucket = new mongodb.GridFSBucket(db, {
    bucketName: 'tracks'
  });
  bucket.drop().then(function () {
    console.log('Tracklist dropped')
    return res.status(200).json({ message: "Track list removed successfully"});
  }, function(error) {
    console.log('error', error)
  });
})

app.listen(3005, () => {
  console.log("App listening on port 3005!");
});