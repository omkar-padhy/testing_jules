import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext, api } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';

const TakeExam = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const videoRef = useRef(null);
  const [warning, setWarning] = useState('');

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await api.get(`/api/exams/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setExam(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchExam();
  }, [id, user]);

  useEffect(() => {
    let model = null;
    let intervalId = null;

    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access denied", err);
        setWarning("Camera access is required for proctoring.");
      }
    };

    const detectFace = async () => {
      if (model && videoRef.current) {
        const predictions = await model.estimateFaces(videoRef.current, false);
        if (predictions.length === 0) {
          setWarning('Warning: No face detected!');
        } else if (predictions.length > 1) {
          setWarning('Warning: Multiple faces detected!');
        } else {
          setWarning('');
        }
      }
    };

    const initProctoring = async () => {
      await setupCamera();
      model = await blazeface.load();
      intervalId = setInterval(detectFace, 2000); // Check every 2 seconds
    };

    if (score === null) {
      initProctoring();
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [score]);

  const handleOptionSelect = (questionId, optionIndex) => {
    setAnswers({ ...answers, [questionId]: optionIndex });
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < exam.questions.length) {
      if (!window.confirm("You have not answered all questions. Submit anyway?")) {
        return;
      }
    }

    try {
      const res = await api.post(`/api/exams/${id}/submit`,
        { answers },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setScore(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to submit exam');
    }
  };

  if (!exam) return <div className="p-4">Loading...</div>;

  if (score !== null) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Exam Completed!</h1>
        <p className="text-2xl">Your Score: {score.score} / {score.total}</p>
        <button onClick={() => navigate('/')} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 flex">
      <div className="flex-1 mr-4">
        <h1 className="text-3xl font-bold mb-2">{exam.title}</h1>
        <p className="mb-6 text-gray-600">{exam.description}</p>

        {exam.questions.map((q, index) => (
          <div key={q.id} className="mb-6 p-4 border rounded shadow-sm bg-white">
            <p className="font-semibold mb-2">{index + 1}. {q.text}</p>
            {q.options.map((opt, oIndex) => (
              <label key={oIndex} className="block mb-1">
                <input
                  type="radio"
                  name={`question-${q.id}`}
                  value={oIndex}
                  checked={answers[q.id] === oIndex}
                  onChange={() => handleOptionSelect(q.id, oIndex)}
                  className="mr-2"
                />
                {opt}
              </label>
            ))}
          </div>
        ))}
        <button onClick={handleSubmit} className="bg-blue-600 text-white px-6 py-2 rounded font-bold">Submit Exam</button>
      </div>

      <div className="w-64">
        <div className="sticky top-4">
          <h3 className="font-bold mb-2">Proctoring Camera</h3>
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-auto bg-black rounded" />
          {warning && <p className="text-red-500 font-bold mt-2 animate-pulse">{warning}</p>}
        </div>
      </div>
    </div>
  );
};

export default TakeExam;
