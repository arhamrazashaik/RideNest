import React from "react";

export default function SheMode() {
  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      {/* Banner */}
      <div className="p-4 bg-pink-100 text-pink-800 rounded-lg shadow mb-6 flex items-center">
        <span className="text-2xl mr-2">🔒</span>
        <div>
          <strong>She Mode Enabled</strong> — You'll be matched with a verified woman driver only.
        </div>
      </div>

      {/* Toggle (always ON for demo) */}
      <div className="flex items-center justify-between p-4 border rounded-lg shadow mb-6 bg-white">
        <span className="font-medium">She Mode (Women Safety)</span>
        <input type="checkbox" checked readOnly className="toggle toggle-success" />
      </div>

      {/* About She Mode */}
      <h2 className="text-2xl font-bold mb-2 text-pink-700">🛡️ She Mode – RideNest's Commitment to Women's Safety</h2>
      <p className="text-gray-700 mb-4">
        Your safety is our priority. With She Mode, RideNest empowers women by allowing them to ride with female drivers only. This mode is designed to create a safer and more comfortable travel experience for women, especially during night-time or solo travel.
      </p>

      {/* How it works */}
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-1">🔒 What is She Mode?</h3>
        <ul className="list-disc pl-6 text-gray-700">
          <li>Matches female riders with female drivers.</li>
          <li>Ensures all drivers shown are safety-verified.</li>
          <li>Is activated by default for women in demo mode.</li>
        </ul>
      </div>

      {/* Demo Driver Card */}
      <div className="p-4 border rounded-lg shadow mb-4 bg-white">
        <h3 className="font-semibold text-lg">👩‍🦰 Priya Sharma</h3>
        <p>Vehicle: Honda Amaze</p>
        <p>Rating: ⭐ 4.8</p>
        <p className="text-green-600">✅ Safety Verified Driver</p>
      </div>

      {/* More info */}
      <p className="text-sm text-gray-600 italic mt-2">
        She Mode helps women feel safer by ensuring their driver is also a woman. This is a safety-first initiative by RideNest.
      </p>

      {/* Coming soon */}
      <div className="mt-6 p-3 bg-pink-50 border-l-4 border-pink-400 text-pink-800 rounded">
        <strong>💡 Coming Soon:</strong> In the full version, She Mode will be customizable, offer fallback options, and integrate with real-time safety alerts.
      </div>
    </div>
  );
} 