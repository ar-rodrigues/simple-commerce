import { useState } from 'react';

export default function useAdminActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addItem = async (item) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al agregar el ítem');
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (item) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/catalog', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al actualizar el ítem');
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (rowIndex) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/catalog?rowIndex=${rowIndex}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al eliminar el ítem');
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, addItem, updateItem, deleteItem };
}
