package com.sistema.juntadevecinos;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.google.firebase.FirebaseApp;
import com.google.firebase.firestore.FirebaseFirestore;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Inicializar Firebase
        FirebaseApp.initializeApp(this);

        // Prueba de Firestore
        FirebaseFirestore db = FirebaseFirestore.getInstance();
        db.collection("testCollection")
          .add(new TestModel("Título de prueba", "Mensaje de prueba"))
          .addOnSuccessListener(documentReference -> {
              System.out.println("Documento añadido con ID: " + documentReference.getId());
          })
          .addOnFailureListener(e -> {
              System.err.println("Error al añadir documento: " + e.getMessage());
          });
    }

    // Clase modelo para la prueba
    public static class TestModel {
        private String title;
        private String message;

        public TestModel(String title, String message) {
            this.title = title;
            this.message = message;
        }

        public String getTitle() {
            return title;
        }

        public String getMessage() {
            return message;
        }
    }
}
