import React, { useState, useContext } from 'react';
import { AuthContext, api } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const CreateExam = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([{ text: '', options: ['', '', '', ''], correct_option: 0 }]);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleAddQuestion = () => {
    setQuestions([...questions, { text: '', options: ['', '', '', ''], correct_option: 0 }]);
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    if (field === 'text') {
      newQuestions[index].text = value;
    } else if (field === 'correct_option') {
      newQuestions[index].correct_option = parseInt(value);
    } else {
      newQuestions[index].options[field] = value;
    }
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/exams',
        { title, description, questions },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Failed to create exam');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Create Exam</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Title</label>
          <input type="text" className="w-full border p-2 rounded" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Description</label>
          <textarea className="w-full border p-2 rounded" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <h2 className="text-2xl font-semibold mb-2">Questions</h2>
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="mb-6 p-4 border rounded bg-gray-50">
            <label className="block mb-1 font-semibold">Question {qIndex + 1}</label>
            <input type="text" className="w-full border p-2 rounded mb-2" value={q.text} onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)} required />

            <div className="grid grid-cols-2 gap-2 mb-2">
              {q.options.map((opt, oIndex) => (
                <input key={oIndex} type="text" className="border p-2 rounded" placeholder={`Option ${oIndex + 1}`} value={opt} onChange={(e) => handleQuestionChange(qIndex, oIndex, e.target.value)} required />
              ))}
            </div>

            <label className="block mb-1 font-semibold">Correct Option Index (0-3)</label>
            <select className="border p-2 rounded" value={q.correct_option} onChange={(e) => handleQuestionChange(qIndex, 'correct_option', e.target.value)}>
              <option value={0}>Option 1</option>
              <option value={1}>Option 2</option>
              <option value={2}>Option 3</option>
              <option value={3}>Option 4</option>
            </select>
          </div>
        ))}

        <div className="flex justify-between">
          <button type="button" onClick={handleAddQuestion} className="bg-gray-500 text-white px-4 py-2 rounded">Add Question</button>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save Exam</button>
        </div>
      </form>
    </div>
  );
};

export default CreateExam;
