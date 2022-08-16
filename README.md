# Team Structure as a Service

To start the service, run 'npm start'. The default localhost is 1010.

To create a member...

To update a member...

To delete a member...

To get members...

To export ...

To import ... \*for simplicity, the app stores the file in memory as a Buffer object.

WARNING: Uploading very large files, or relatively small files in large numbers very quickly, can cause your application to run out of memory when memory storage is used.

Probably, think of storing the file temporarly first, and then parse it?

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

limits
An object specifying the size limits of the following optional properties. Multer passes this object into busboy directly, and the details of the properties can be found on busboy's page.

The following integer values are available:

Key Description Default
fieldNameSize Max field name size 100 bytes
fieldSize Max field value size (in bytes) 1MB
fields Max number of non-file fields Infinity
fileSize For multipart forms, the max file size (in bytes) Infinity
files For multipart forms, the max number of file fields Infinity
parts For multipart forms, the max number of parts (fields + files) Infinity
headerPairs For multipart forms, the max number of header key=>value pairs to parse 2000

Specifying the limits can help protect your site against denial of service (DoS) attacks.

For simplicity, the service works with a single team.

The member.service.ts represents our tree structure.

A reasonable test coverage with jest and supertest.

-> insert image here <--

run 'npm test'

<img width="867" alt="image" src="https://user-images.githubusercontent.com/9366962/184987597-ffc757bd-330a-49dc-8d64-f782f42cb19f.png">

Angular client app

cd client
npm start
