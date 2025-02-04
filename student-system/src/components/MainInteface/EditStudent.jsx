import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CreateStudent.css'; // CSS remains the same
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate, useParams } from 'react-router-dom';

const EditStudent = () => {
  const [name, setName] = useState('');
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [studentClass, setStudentClass] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [availableCourses, setAvailableCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [errors, setErrors] = useState({});
  
  const navigate = useNavigate();
  const { id } = useParams(); // Get student ID from route params

  // Fetch student data, courses, and classes when the component mounts
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const studentResponse = await axios.get(`https://localhost:44308/api/getStudent/${id}`);
        console.log(studentResponse.data); // Log the full response for debugging
        const std =studentResponse.data;
        const { MarkedCourses } = studentResponse.data;
        
        // Ensure these fields exist in the student object
        setName(std.Name); // Default to empty string if undefined
        setContactNumber(std.ContactNumber);
        setStudentClass(std.ClassId);
        
        // Assuming MarkedCourses is an array of course IDs
        setSelectedCourses(MarkedCourses ? MarkedCourses.map(course => ({ id: course, name: course })) : []);

        const coursesResponse = await axios.get('https://localhost:44308/api/courses');
        const classesResponse = await axios.get('https://localhost:44308/api/classes');

        setAvailableCourses(coursesResponse.data);
        setClasses(classesResponse.data);
      } catch (error) {
        console.error('Error fetching student data:', error);
        setErrors({ fetchError: 'Failed to fetch data' });
      }
    };

    fetchStudentData();
  }, [id]);

  const addCourse = (courseId, courseName) => {
    if (selectedCourses.find(course => course.id === courseId)) {
      alert('This course is already added.');
    } else {
      setSelectedCourses([...selectedCourses, { id: courseId, name: courseName }]);
    }
  };

  const removeCourse = (courseId) => {
    setSelectedCourses(selectedCourses.filter(course => course.id !== courseId));
  };

  const resetForm = () => {
    setName('');
    setSelectedCourses([]);
    setStudentClass('');
    setContactNumber('');
    setErrors({});
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    if (!name.trim()) {
      newErrors.nameError = 'Please enter the student\'s name.';
      isValid = false;
    }

    if (!studentClass) {
      newErrors.classError = 'Please select a class.';
      isValid = false;
    }

    if (selectedCourses.length === 0) {
      newErrors.courseError = 'Please select at least one course.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      const updatedStudentData = {
        student: {
          Id: id,
          Name: name,
          ContactNumber: contactNumber,
          Class: studentClass,
        },
        MarkedCourses: selectedCourses.map(course => course.id),
      };

      axios.put(`https://localhost:44308/api/edit/${id}`, updatedStudentData)
        .then(response => {
          console.log(response);
          navigate('/list-students'); // Navigate back to the student list after updating
        })
        .catch(error => {
          console.error(error);
        });
    }
  };

  return (
    <div className="container d-flex justify-content-center formapp">
      <form onSubmit={handleSubmit} id="studentForm">
        {/* Student Name */}
        <div className="form-row mb-3">
          <div className="col-md-3 label-width">
            <label htmlFor="Name" className="col-form-label">Student Name</label>
          </div>
          <div className="col-md-9">
            <input
              type="text"
              id="Name"
              name="Name"
              className="form-control form-control-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter Student Name"
            />
            {errors.nameError && <div className="text-danger">{errors.nameError}</div>}
          </div>
        </div>

        {/* Course Selection */}
        <div className="form-row mb-3">
          <div className="col-md-3 label-width">
            <label htmlFor="availableCourses" className="col-form-label">Select Course</label>
          </div>
          <div className="col-md-9 course-controls">
            <select id="availableCourses" className="form-control form-control-sm">
              <option value="">Select Course</option>
              {availableCourses.map(course => (
                <option key={course.Value} value={course.Value}>
                  {course.Text}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn-success"
              onClick={() => {
                const selectedCourseId = document.getElementById('availableCourses').value;
                const selectedCourseText = availableCourses.find(course => course.Value === selectedCourseId)?.Text;
                if (selectedCourseId) {
                  addCourse(selectedCourseId, selectedCourseText);
                }
              }}
            >
              +
            </button>
            <button type="button" className="btn btn-danger" onClick={removeCourse}>-</button>
          </div>
          {errors.courseError && <div className="text-danger">{errors.courseError}</div>}
        </div>

        {/* Selected Courses */}
        <div className="form-row mb-3">
          <div className="col-md-3 label-width">
            <label className="col-form-label">Selected Courses</label>
          </div>
          <div className="col-md-9 course-box">
            <div id="selectedCourses">
              {selectedCourses.map(course => (
                <span key={course.Value} className="course-tag">
                  {course.Text} <button type="button" className="btn btn-sm btn-danger" onClick={() => removeCourse(course.Value)}>x</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Class Selection */}
        <div className="form-row mb-3">
          <div className="col-md-3 label-width">
            <label htmlFor="Class" className="col-form-label">Class</label>
          </div>
          <div className="col-md-9">
            <select
              id="Class"
              name="Class"
              className="form-control form-control-sm"
              value={studentClass}
              onChange={(e) => setStudentClass(e.target.value)}
            >
              <option value="">Select Class</option>
              {classes.map(cls => (
                <option key={cls.Value} value={cls.Value}>
                  {cls.Text}
                </option>
              ))}
            </select>
            {errors.classError && <div className="text-danger">{errors.classError}</div>}
          </div>
        </div>

        {/* Contact Number */}
        <div className="form-row mb-3">
          <div className="col-md-3 label-width">
            <label htmlFor="ContactNumber" className="col-form-label">Contact Number</label>
          </div>
          <div className="col-md-9">
            <input
              type="tel"
              id="ContactNumber"
              name="ContactNumber"
              className="form-control form-control-sm"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="Enter Contact Number"
            />
          </div>
        </div>

        {/* Submit and Reset Buttons */}
        <div className="form-row">
          <div className="col-md-3"></div>
          <div className="col-md-9">
            <button type="submit" className="btn submit-btn">Submit</button>
            <button type="button" className="btn reset-btn mx-lg-5" onClick={resetForm}>Reset</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditStudent;
