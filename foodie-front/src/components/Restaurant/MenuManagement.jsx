import { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
// eslint-disable-next-line no-unused-vars
import { FolderPlus, Plus, Edit, Trash2 } from 'lucide-react';
 
export function MenuManagement({ restaurantId }) {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    if (restaurantId) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  const loadData = async () => {
    if (!restaurantId) return;
    
    try {
      const [categories, items] = await Promise.all([
        apiFetch(`/restaurants/${restaurantId}/categories`),
        apiFetch(`/restaurants/${restaurantId}/menu-items`)
      ]);
      setCategories(categories);
      setMenuItems(items);
    } catch (error) {
      console.error('Error loading menu data:', error);
    }
    setLoading(false);
  };

  const deleteMenuItem = async (id) => {
    if (!confirm('Delete this menu item?')) return;

    try {
      await apiFetch(`/menu-items/${id}`, {
        method: 'DELETE',
      });
      loadData();
    } catch {
      alert('Failed to delete item');
    }
  };

  const toggleAvailability = async (item) => {
    try {
      await apiFetch(`/menu-items/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({ available: !item.available }),
      });
      loadData();
    } catch {
      alert('Failed to update availability');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Menu Management</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCategoryForm(true)}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 font-medium inline-flex items-center transition-colors"
          >
            <FolderPlus className="w-5 h-5 mr-2" />
            Add Category
          </button>
          <button
            onClick={() => {
              setEditingItem(null);
              setShowItemForm(true);
            }}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 font-medium inline-flex items-center transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Item
          </button>
        </div>
      </div>

      {categories.length === 0 && menuItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">No menu items yet</p>
          <p className="text-sm text-gray-400">Start by adding categories and menu items</p>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((category) => {
            const items = menuItems.filter((item) => item.category_id === category.id);
            return (
              <div key={category.id} className="bg-white rounded-lg shadow">
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <h3 className="text-lg font-bold text-gray-900">{category.name}</h3>
                </div>
                <div className="p-6">
                  {items.length === 0 ? (
                    <p className="text-gray-500 text-sm">No items in this category</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className={`border rounded-lg p-4 ${
                            item.available ? 'bg-white' : 'bg-gray-50 opacity-60'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{item.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                              <p className="text-lg font-bold text-orange-600 mt-2">
                                ${item.price.toFixed(2)}
                              </p>
                            </div>
                            {item.image_url && (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-20 h-20 object-cover rounded-lg ml-4"
                              />
                            )}
                          </div>
                          <div className="flex space-x-2 mt-3">
                            <button
                              onClick={() => toggleAvailability(item)}
                              className={`flex-1 px-3 py-1 rounded text-sm font-medium transition-colors ${
                                item.available
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {item.available ? 'Available' : 'Unavailable'}
                            </button>
                            <button
                              onClick={() => {
                                setEditingItem(item);
                                setShowItemForm(true);
                              }}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteMenuItem(item.id)}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {menuItems.filter((item) => !item.category_id).length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <h3 className="text-lg font-bold text-gray-900">Uncategorized</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {menuItems
                    .filter((item) => !item.category_id)
                    .map((item) => (
                      <div
                        key={item.id}
                        className={`border rounded-lg p-4 ${
                          item.available ? 'bg-white' : 'bg-gray-50 opacity-60'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{item.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                            <p className="text-lg font-bold text-orange-600 mt-2">
                              ${item.price.toFixed(2)}
                            </p>
                          </div>
                          {item.image_url && (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-20 h-20 object-cover rounded-lg ml-4"
                            />
                          )}
                        </div>
                        <div className="flex space-x-2 mt-3">
                          <button
                            onClick={() => toggleAvailability(item)}
                            className={`flex-1 px-3 py-1 rounded text-sm font-medium transition-colors ${
                              item.available
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {item.available ? 'Available' : 'Unavailable'}
                          </button>
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setShowItemForm(true);
                            }}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteMenuItem(item.id)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {showCategoryForm && (
        <CategoryForm
          restaurantId={restaurantId}
          onClose={() => setShowCategoryForm(false)}
          onSuccess={() => {
            setShowCategoryForm(false);
            loadData();
          }}
        />
      )}

      {showItemForm && (
        <MenuItemForm
          restaurantId={restaurantId}
          categories={categories}
          item={editingItem}
          onClose={() => {
            setShowItemForm(false);
            setEditingItem(null);
          }}
          onSuccess={() => {
            setShowItemForm(false);
            setEditingItem(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}

// eslint-disable-next-line no-unused-vars
function CategoryForm({ restaurantId, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiFetch('/categories', {
        method: 'POST',
        body: JSON.stringify({
          restaurant_id: restaurantId,
          name,
        }),
      });
      onSuccess();
    } catch {
      alert('Failed to create category');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Add Category</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="e.g., Pizza, Burgers"
            />
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:bg-gray-300 font-medium transition-colors"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// eslint-disable-next-line no-unused-vars
function MenuItemForm({ restaurantId, categories, item, onClose, onSuccess }) {
  const [name, setName] = useState(item?.name || '');
  const [description, setDescription] = useState(item?.description || '');
  const [price, setPrice] = useState(item?.price.toString() || '');
  const [imageUrl, setImageUrl] = useState(item?.image_url || '');
  const [categoryId, setCategoryId] = useState(item?.category_id || '');
  const [preparingTime, setPreparingTime] = useState(item?.preparing_time?.toString() || '');
  const [onTheWayTime, setOnTheWayTime] = useState(item?.on_the_way_time?.toString() || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      restaurant_id: restaurantId,
      name,
      description: description || null,
      price: parseFloat(price),
      image_url: imageUrl || null,
      category_id: categoryId || null,
      preparing_time: preparingTime ? parseInt(preparingTime) : null,
      on_the_way_time: onTheWayTime ? parseInt(onTheWayTime) : null,
    };

    try {
      await apiFetch(item ? `/menu-items/${item.id}` : '/menu-items', {
        method: item ? 'PUT' : 'POST',
        body: JSON.stringify(data),
      });
      onSuccess();
    } catch {
      alert('Failed to save menu item');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {item ? 'Edit Menu Item' : 'Add Menu Item'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Margherita Pizza"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Fresh tomatoes, mozzarella, and basil"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="12.99"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preparing Time (minutes)
              </label>
              <input
                type="number"
                min="0"
                value={preparingTime}
                onChange={(e) => setPreparingTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="15"
              />
              <p className="text-xs text-gray-500 mt-1">Time needed to prepare this dish</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                On the Way Time (minutes)
              </label>
              <input
                type="number"
                min="0"
                value={onTheWayTime}
                onChange={(e) => setOnTheWayTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="20"
              />
              <p className="text-xs text-gray-500 mt-1">Time needed for delivery</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">No category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="https://example.com/pizza.jpg"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:bg-gray-300 font-medium transition-colors"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
