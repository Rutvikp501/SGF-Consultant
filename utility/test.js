// openapi: 3.0.0
// info:
//   title: User Management API
//   version: 1.0.0
//   description: API documentation for User Management and Lead Management

// components:
//   securitySchemes:
//     bearerAuth:
//       type: http
//       scheme: bearer
//       bearerFormat: JWT

// security:
//   - bearerAuth: []

// paths:
//   /:
//     get:
//       tags:
//         - Home
//       description: Home Page
//       responses:
//         '200':
//           description: Home Page
//         '401':
//           description: Unauthorized

//   /api/user/:
//     get:
//       tags:
//         - User API
//       description: Get all users
//       responses:
//         '200':
//           description: Success
//         '400':
//           description: Bad Request

//   /api/user/getSearcheduser:
//     post:
//       tags:
//         - User API
//       description: Search for users
//       requestBody:
//         required: true
//         content:
//           application/json:
//             schema:
//               type: object
//               properties:
//                 search:
//                   type: string
//       responses:
//         '200':
//           description: Success
//         '400':
//           description: Bad Request

//   /api/user/login:
//     post:
//       tags:
//         - User API
//       description: User login
//       requestBody:
//         required: true
//         content:
//           application/json:
//             schema:
//               type: object
//               properties:
//                 email_id:
//                   type: string
//                 password:
//                   type: string
//       responses:
//         '200':
//           description: Success
//         '400':
//           description: Bad Request

//   /api/user/register:
//     post:
//       tags:
//         - User API
//       description: Register a new user
//       requestBody:
//         required: true
//         content:
//           application/json:
//             schema:
//               type: object
//               properties:
//                 User_code:
//                   type: string
//                 User_name:
//                   type: string
//                 email_id:
//                   type: string
//                 mobile_no:
//                   type: number
//                 password:
//                   type: string
//                 isAdmin:
//                   type: boolean
//                 dateOfJoining:
//                   type: string
//       responses:
//         '200':
//           description: Success
//         '400':
//           description: Bad Request

//   /api/user/update/{id}:
//     patch:
//       tags:
//         - User API
//       description: Update a user
//       parameters:
//         - in: path
//           name: id
//           required: true
//           schema:
//             type: string
//       requestBody:
//         required: true
//         content:
//           application/json:
//             schema:
//               type: object
//               properties:
//                 User_name:
//                   type: string
//                 email_id:
//                   type: string
//                 password:
//                   type: string
//       responses:
//         '200':
//           description: Success
//         '400':
//           description: Bad Request

//   /api/user/delete/{id}:
//     delete:
//       tags:
//         - User API
//       description: Delete a user
//       parameters:
//         - in: path
//           name: id
//           required: true
//           schema:
//             type: string
//       responses:
//         '200':
//           description: Success
//         '404':
//           description: User not found
//         '500':
//           description: Internal server error

//   /api/user/forgotPassword:
//     post:
//       tags:
//         - User API
//       description: User forgotPassword
//       requestBody:
//         required: true
//         content:
//           application/json:
//             schema:
//               type: object
//               properties:
//                 email_id:
//                   type: string
//       responses:
//         '200':
//           description: Success
//         '400':
//           description: Bad Request

//   /api/user/resetPassword:
//     post:
//       tags:
//         - User API
//       description: User resetPassword
//       requestBody:
//         required: true
//         content:
//           application/json:
//             schema:
//               type: object
//               properties:
//                 email_id:
//                   type: string
//                 otp:
//                   type: string
//                 newPassword:
//                   type: string
//       responses:
//         '200':
//           description: Success
//         '400':
//           description: Bad Request


//   /api/lead/addLead:
//     post:
//       tags:
//         - Lead API
//       description: Add a new lead
//       requestBody:
//         required: true
//         content:
//           application/json:
//             schema:
//               type: object
//               properties:
//                 Adviser:
//                   type: string
//                 name:
//                   type: string
//                 email:
//                   type: string
//                 phone:
//                   type: string
//                 eventName:
//                   type: string
//                 eventDate:
//                   type: string
//                   format: date
//                 eventLocation:
//                   type: string
//                 pincode:
//                   type: string
//                 eventSpecialsName:
//                   type: string
//                 specialCode:
//                   type: string
//                 leadType:
//                   type: string
//                 status:
//                   type: string
//                   enum: ['Pending', 'Converted', 'Junk']
//                 cycle:
//                   type: number
//                 conversionDate:
//                   type: string
//                   format: date
//       responses:
//         '200':
//           description: Success
//         '400':
//           description: Bad Request

//   /api/lead/getAllLeads:
//     get:
//       tags:
//         - Lead API
//       description: Get all leads
//       responses:
//         '200':
//           description: Success
//         '400':
//           description: Bad Request

//   /api/lead/getSearchedLeads:
//     post:
//       tags:
//         - Lead API
//       description:  Get leads by Search  
//       requestBody:
//         required: true
//         content:
//           application/json:
//             schema:
//               type: object
//               properties:
//                 search:
//                   type: string
//       responses:
//         '200':
//           description: Success
//         '400':
//           description: Bad Request




//   /api/lead/getAdditionalData/{leadId}:
//     get:
//       tags:
//         - Lead API
//       description: Get additional data for a lead
//       parameters:
//         - in: path
//           name: leadId
//           required: true
//           schema:
//             type: string
//       responses:
//         '200':
//           description: Success
//         '404':
//           description: No additional data found
//         '500':
//           description: Internal server error
