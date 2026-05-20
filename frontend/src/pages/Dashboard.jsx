import React, { useContext, useEffect, useState } from 'react';
import { AuthContext, api } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [exams, setExams] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchExams = async () => {
      try {
        const res = await api.get('/api/exams', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setExams(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchExams();
  }, [user, navigate]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>

      {(user?.role === 'Teacher' || user?.role === 'Admin') && (
        <button
          onClick={() => navigate('/create-exam')}
          className="bg-green-500 text-white px-4 py-2 rounded mb-4"
        >
          Create New Exam
        </button>
      )}

      <h2 className="text-2xl font-semibold mb-2">Available Exams</h2>
      {exams.length === 0 ? (
        <p>No exams available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map(exam => (
            <div key={exam.id} className="border p-4 rounded shadow">
              <h3 className="text-xl font-bold">{exam.title}</h3>
              <p className="mb-4">{exam.description}</p>
              {user?.role === 'Student' && (
                <button
                  onClick={() => navigate(`/exam/${exam.id}`)}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Take Exam
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
