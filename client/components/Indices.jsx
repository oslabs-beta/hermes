import React from 'react';

function Indices({ name }) {
  console.log(name);
  return (
    <div className='indices'>
      <h1>{name}</h1>
    </div>
  );
}

export default Indices;
