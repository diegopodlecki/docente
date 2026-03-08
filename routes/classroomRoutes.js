const express = require('express');
const router = express.Router();

const { oauth2Client } = require('../authGoogle');
const { getCourses, getStudents } = require('../services/classroomService');

// GET /classroom/courses
router.get('/courses', async (req, res) => {
  try {
    const courses = await getCourses(oauth2Client);
    res.json({ courses });
  } catch (err) {
    console.error('Failed to fetch classroom courses', err);
    res.status(500).json({ error: 'Unable to retrieve courses' });
  }
});

// GET /classroom/courses/:courseId/students
router.get('/courses/:courseId/students', async (req, res) => {
  const { courseId } = req.params;
  try {
    const students = await getStudents(courseId, oauth2Client);
    res.json({ students });
  } catch (err) {
    console.error(`Failed to fetch students for course ${courseId}`, err);
    res.status(500).json({ error: 'Unable to retrieve students' });
  }
});

module.exports = router;