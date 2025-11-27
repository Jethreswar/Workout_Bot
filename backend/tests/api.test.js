const request = require('supertest');
const app = require('../server'); // You'll need to export your app from server.js

describe('API Health Check', () => {
  test('GET /api/workouts should return 200', async () => {
    const response = await request(app)
      .get('/api/workouts')
      .expect('Content-Type', /json/)
      .expect(200);
    
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('Server should be running', async () => {
    const response = await request(app)
      .get('/api/workouts')
      .expect(200);
    
    expect(response).toBeDefined();
  });
});

describe('Workout Controller', () => {
  test('Should handle workout creation', async () => {
    const newWorkout = {
      title: 'Test Workout',
      reps: 10,
      load: 50,
      category: 'Strength'
    };

    const response = await request(app)
      .post('/api/workouts')
      .send(newWorkout)
      .expect(201);

    expect(response.body).toHaveProperty('_id');
    expect(response.body.title).toBe(newWorkout.title);
  });
});