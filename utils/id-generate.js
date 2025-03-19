createID: async (parent, { id }) => {
  try {
    // Fetch the last purchase process entry
    const lastProcess = await prisma.purchaseProcess.findFirst({
      orderBy: {
        purchaseProcessId: "desc", // Ensure this matches your actual ID field
      },
      select: {
        purchaseProcessId: true,
      },
    });

    let nextProcessId;

    if (lastProcess) {
      // Extract the numeric portion of the last ID
      const lastProcessID = lastProcess.purchaseProcessId;
      const lastNumericID = parseInt(lastProcessID, 10); // Convert to integer directly

      // Increment the numeric part by one
      const nextNumericID = lastNumericID + 1;

      // Convert back to string if necessary
      nextProcessId = nextNumericID.toString();
    } else {
      // If no process found, start with 1
      nextProcessId = "1"; // Starting point
    }

    // Return the nextProcessId
    return nextProcessId;
  } catch (error) {
    console.error("Error generating Purchase Process ID:", error);
    throw new Error("Internal server error");
  }
};
