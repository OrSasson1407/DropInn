import React from 'react';
import { useParams, Link } from 'react-router-dom';

export default function ProviderDetails() {
  const { id } = useParams();
  return (
    <div style={{ padding: '20px' }}>
      <h2>Provider Profile</h2>
      <p>ID: {id}</p>
      <p>Service: Men's Haircut</p>
      <Link to={'/customer/book/' + id}><button style={{ padding: '10px', background: 'black', color: 'white', cursor: 'pointer' }}>Book Now</button></Link>
    </div>
  );
}
