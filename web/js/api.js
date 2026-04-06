const headers = {
  "Content-Type": "application/json"
};

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers,
    ...options
  });

  if (response.status === 204) {
    return null;
  }

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.error || "Ocurrio un error inesperado.");
  }

  return body.data;
}

export function getStudents() {
  return request("/api/students");
}

export function createStudent(payload) {
  return request("/api/students", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateStudent(id, payload) {
  return request(`/api/students/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteStudent(id) {
  return request(`/api/students/${id}`, {
    method: "DELETE"
  });
}
