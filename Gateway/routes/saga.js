// Gateway SAGA endpoints
const express = require('express');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     SAGAUsernameUpdate:
 *       type: object
 *       required:
 *         - username
 *       properties:
 *         username:
 *           type: string
 *           example: "new.username"
 *     SAGAResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         userId:
 *           type: integer
 *         oldUsername:
 *           type: string
 *         newUsername:
 *           type: string
 */

/**
 * @swagger
 * /auth/user/list:
 *   get:
 *     tags: [SAGA Transactions]
 *     summary: Lista korisnika za testiranje SAGA transakcija
 *     description: Prikazuje sve korisnike sa ID i username za testiranje distributed transakcija
 *     responses:
 *       200:
 *         description: Lista korisnika
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: {type: integer}
 *                       username: {type: string}
 *                       email: {type: string}
 *                       role: {type: string}
 */

/**
 * @swagger
 * /auth/user/{id}/username:
 *   put:
 *     tags: [SAGA Transactions]
 *     summary: 🚀 SAGA - Distributed Username Update
 *     description: |
 *       **SAGA Pattern Implementation**
 *       
 *       Ova transakcija ažurira username u **2 mikroservisa**:
 *       1. **AuthenticationService** - ažurira username u PostgreSQL
 *       2. **ComplaintsService** - ažurira assigneeUsername u svim žalbama u Elasticsearch
 *       
 *       **Compensating Actions**: Ako bilo koji korak ne uspije, sve se vraća na prethodno stanje.
 *       
 *       **Test scenario**: Promeni username korisniku i vidi kako se propagira kroz sistem.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID (dobij iz /auth/user/list)
 *         example: 6
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SAGAUsernameUpdate'
 *     responses:
 *       200:
 *         description: SAGA transakcija uspešna - username ažuriran u svim servisima
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SAGAResponse'
 *       500:
 *         description: SAGA transakcija neuspešna - rollback izvršen
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: {type: string}
 *                 details: {type: string}
 */

module.exports = router;