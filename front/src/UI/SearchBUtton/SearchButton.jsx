// src/UI/SearchButton/SearchButton.jsx
import React from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Button } from 'antd';

const SearchButton = ({ onClick, children = 'Поиск', ...props }) => (
  <Button type="primary" icon={<SearchOutlined />} onClick={onClick} {...props}>
    {children}
  </Button>
);

export default SearchButton;
