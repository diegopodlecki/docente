const { google } = require('googleapis');

/**
 * Fetches the list of courses for the authenticated teacher.
 *
 * @param {object} auth - An authenticated OAuth2 client (google.auth.OAuth2)
 * @returns {Promise<Array>} Array of course objects returned by Classroom API.
 */
async function getCourses(auth) {
  try {
    const classroom = google.classroom({ version: 'v1', auth });
    const res = await classroom.courses.list({
      courseStates: ['ACTIVE'],
      teacherId: 'me',
      pageSize: 100
    });

    // API returns courses in res.data.courses, may be undefined when none found
    return res.data.courses || [];
  } catch (err) {
    console.error('Error fetching courses from Classroom API', err);
    // Re-throw so caller can decide how to handle
    throw err;
  }
}

/**
 * Retrieves the students enrolled in a given course.
 *
 * @param {string} courseId - The Classroom course identifier.
 * @param {object} auth - Authenticated OAuth2 client.
 * @returns {Promise<Array>} Array of student objects with name, email, id, photoUrl.
 */
async function getStudents(courseId, auth) {
  try {
    const classroom = google.classroom({ version: 'v1', auth });
    const res = await classroom.courses.students.list({
      courseId,
      pageSize: 200
    });

    const studentsRaw = res.data.students || [];
    // map to trimmed objects
    return studentsRaw.map(s => ({
      id: s.profile && s.profile.id,
      fullName: s.profile && s.profile.name && s.profile.name.fullName,
      email: s.profile && s.profile.emailAddress,
      photoUrl: s.profile && s.profile.photoUrl
    }));
  } catch (err) {
    console.error(`Error fetching students for course ${courseId}`, err);
    throw err;
  }
}

module.exports = { getCourses, getStudents };