// Helper utility for Google Calendar API integration & iCal (.ics) file generation

/**
 * Generates an .ics file download for a booking/order
 */
export const downloadICalFile = (order) => {
  const serviceName = order.serviceName || order.category || 'Service';
  const title = `DropInn Booking: ${serviceName} #${(order.id || 'booking').substring(0, 8)}`;
  const description = `DropInn Appointment at ${order.address || 'Client Address'}. Total: ${order.price || 0} ILS.`;
  const location = order.address || 'Unspecified Location';
  
  const now = new Date();
  // Support both Firestore Timestamps and standard ISO dates
  const startTime = order.createdAt?.toDate ? order.createdAt.toDate() : (order.startTime ? new Date(order.startTime) : new Date());
  
  // Dynamically pull duration from the order, default to 60 mins
  const durationMinutes = order.duration || 60;
  const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

  const formatDate = (date) => {
    return date.toISOString().replace(/-|:|\.\d+/g, '');
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DropInn//Booking Sync//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:dropin-order-${order.id || Date.now()}@dropin.app`,
    `DTSTAMP:${formatDate(now)}`,
    `DTSTART:${formatDate(startTime)}`,
    `DTEND:${formatDate(endTime)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `dropin-booking-${order.id || 'appointment'}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Adds an event to Google Calendar via Google Calendar API or Direct Web Link
 */
export const syncWithGoogleCalendar = async (order, accessToken = null) => {
  const serviceName = order.serviceName || order.category || 'Service';
  const startTime = order.createdAt?.toDate ? order.createdAt.toDate() : (order.startTime ? new Date(order.startTime) : new Date());
  
  const durationMinutes = order.duration || 60;
  const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

  const eventPayload = {
    summary: `DropInn: ${serviceName} #${(order.id || '').substring(0, 8)}`,
    location: order.address || 'Unspecified Location',
    description: `DropInn Appointment. Total: ${order.price || 0} ILS. Customer Address: ${order.address || 'On-location'}`,
    start: {
      dateTime: startTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jerusalem'
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jerusalem'
    }
  };

  // If OAuth access token is provided, perform direct Google Calendar API POST request
  if (accessToken) {
    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventPayload)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error?.message || 'Google Calendar API request failed');
    }

    return await res.json();
  }

  // Fallback: Open Google Calendar Web Event Creation with pre-filled parameters
  const isoStart = startTime.toISOString().replace(/-|:|\.\d+/g, '');
  const isoEnd = endTime.toISOString().replace(/-|:|\.\d+/g, '');
  const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventPayload.summary)}&dates=${isoStart}/${isoEnd}&details=${encodeURIComponent(eventPayload.description)}&location=${encodeURIComponent(eventPayload.location)}`;
  
  window.open(googleCalUrl, '_blank');
  return { webLink: googleCalUrl };
};
