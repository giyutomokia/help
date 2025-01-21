import React, { useEffect, useState } from 'react';

const LayoutEditor = ({ layout, onChange, emailConfig }) => {
  const [renderedLayout, setRenderedLayout] = useState('');

  useEffect(() => {
    if (layout) {
      let updatedLayout = layout;
      updatedLayout = updatedLayout.replace('{{title}}', emailConfig.title);
      updatedLayout = updatedLayout.replace('{{content}}', emailConfig.content);
      updatedLayout = updatedLayout.replace('{{footer}}', emailConfig.footer);
      updatedLayout = updatedLayout.replace('{{imageUrls}}', emailConfig.imageUrls.join(','));
      setRenderedLayout(updatedLayout);
    }
  }, [layout, emailConfig]);

  return (
    <div className="layout-preview">
      <div dangerouslySetInnerHTML={{ __html: renderedLayout }} />
    </div>
  );
};

export default LayoutEditor;
