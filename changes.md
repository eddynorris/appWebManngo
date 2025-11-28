Walkthrough: Date Standardization and Voice Commands
Overview
This update introduces a standardized approach to date handling across the API, ensuring all timestamps are consistent with the Peru timezone (UTC-5). Additionally, it adds a new Voice Command feature powered by Gemini, allowing users to register sales and expenses using natural language.

Changes
1. Date Standardization
We have centralized date and time logic to avoid timezone discrepancies.

[NEW] 
date_utils.py
Created a utility module to handle Peru timezone conversions.
Key functions: get_peru_now(), to_peru_time().
[MODIFY] 
common.py
Updated parse_iso_datetime to be more robust.
Integrated date_utils for consistent timezone handling.
2. Voice Commands
A new resource has been added to process natural language commands.

[NEW] 
voice_resource.py
Implements VoiceCommandResource.
Uses GeminiService to interpret user intent.
Returns structured JSON with action type (registrar_venta, registrar_gasto) and extracted parameters.
[NEW] 
gemini_service.py
Integrates Google's gemini-2.0-flash-exp model.
Defines function schemas for:
registrar_venta: Extracts client name, products (name, quantity, price), and payment method.
registrar_gasto: Extracts description, amount, and category.
Uses system prompts to provide context (e.g., current date/time in Peru) for accurate interpretation.
Verification Results
Automated Tests
Unit Tests: Created and ran tests/test_gemini_service.py verifying:
Sales command parsing.
Expense command parsing.
Unknown command handling.
Error handling.
Date Handling: Verified that get_peru_now() returns the correct time offset.
Manual Verification
API Endpoints: Checked GET /pedidos to ensure dates are returned correctly.
Voice Endpoint: Sent POST requests to /api/voice/command with audio transcripts/text and verified database entries.
Frontend Integration Guide (Complex Voice Commands)
The workflow for voice commands is now Parse -> Confirm -> Save.

1. Parse Voice Command
Send the transcript to /api/voice/command.

// Response Structure
{
  "status": "success",
  "processed_action": "confirmar_operacion",
  "data": {
    "cliente": { "id": 1, "nombre": "Pollo Loko", "match_type": "exact" }, // or null if not found
    "items": [
      {
        "producto_nombre_buscado": "carbon",
        "producto_id": 10, // null if not found
        "producto_nombre": "Carbón 20kg",
        "cantidad": 20,
        "precio_unitario": 30.0, // Suggested or explicit
        "subtotal": 600.0,
        "stock_actual": 100,
        "lote_id": 5
      }
    ],
    "pagos": [
      { "monto": 400, "metodo_pago": "efectivo", "es_deposito": false },
      { "monto": 200, "metodo_pago": "yape_plin", "es_deposito": false }
    ],
    "gasto_asociado": { "descripcion": "Taxi", "monto": 30, "categoria": "logistica" },
    "warnings": ["Stock insuficiente..."],
    "contexto": {
        "almacen_id": 14,
        "almacen_nombre": "Almacén Principal"
    }
  }
}
2. Confirm & Save
Display the data to the user in a modal. Allow them to edit (e.g., select correct client, adjust quantities). Then, send the confirmed JSON to /api/transacciones/venta-completa.

// POST /api/transacciones/venta-completa
// Payload: The same JSON structure as 'data' above (after user edits)
### 3. Optimal Frontend UX (Confirmation Modal)
To handle this "optimally" in your Angular application:
1.  **Trigger a Modal**: Upon receiving the `success` response from `/api/voice/command`, immediately open a modal (e.g., `VoiceConfirmationComponent`).
2.  **Bind Data**: Pass the `response.data` object directly to this modal.
3.  **Handle Warnings**:
    *   If `data.warnings` is not empty, display them prominently (e.g., yellow alert box at the top).
    *   Highlight the fields that were "assumed" (e.g., if "Pollo Loko" was fuzzy matched, show an icon next to the client name).
4.  **Allow Edits**:
    *   **Client**: Allow the user to remove the detected client and search for a different one manually if the fuzzy match was wrong.
    *   **Items**: Allow changing quantity or price.
5.  **One-Click Confirm**:
    *   Provide a big "Confirmar Venta" button.
    *   This button sends the **entire `data` object** (with any user edits) to `POST /api/transacciones/venta-completa`.
```typescript
// Example Angular Method for Final Confirmation
confirmTransaction(confirmedData: any) {
  this.http.post('/api/transacciones/venta-completa', confirmedData).subscribe({
    next: (res) => {
      this.toastr.success('Venta registrada correctamente');
      this.closeModal();
    },
    error: (err) => this.toastr.error('Error al guardar venta')
  });
}