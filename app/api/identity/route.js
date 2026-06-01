import { NextResponse } from "next/server";

export async function PATCH(request) {
  try {
    const { oldEmail, newEmail } = await request.json();

    const apiResponse = await fetch("https://unification.useinsider.com/api/user/v1/identity", {
      method: "PATCH",
      headers: {
        "X-PARTNER-NAME": "cebupacificcdppoc",
        "X-REQUEST-TOKEN": process.env.INSIDER_REQUEST_TOKEN, 
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        old_identifier: { email: oldEmail },
        new_identifier: { email: newEmail }
      })
    });

    if (!apiResponse.ok) {
      // Grab the exact text response from Insider to read the true error
      const errorText = await apiResponse.text();
      console.error(`Insider API Rejected Request (${apiResponse.status}):`, errorText);
      return NextResponse.json({ error: "Insider API sync failed", details: errorText }, { status: apiResponse.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Internal Server Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}