export default function ProductCard({ product, onAddToCart }) {
  return (
    <div className="bg-white border rounded-lg shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-300">
      <div className="relative w-full h-48 bg-gray-200">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-800 truncate">{product.name}</h3>
        <p className="text-sm text-gray-600 mt-1 h-10 overflow-hidden">{product.description}</p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-2xl font-extrabold text-gray-900">${product.price}</span>
          <button
            onClick={() => onAddToCart(product)}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform group-hover:scale-105 transition-transform"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
