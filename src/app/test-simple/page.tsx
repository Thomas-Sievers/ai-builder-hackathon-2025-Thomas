'use client'

export default function TestSimplePage() {
  console.log('TestSimplePage: Rendering')
  
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white">
        <h1 className="text-2xl font-bold">Test Simple Page</h1>
        <p>This page works without AuthContext</p>
      </div>
    </div>
  )
}
