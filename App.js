import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Platform
} from 'react-native';

import { db } from './firebaseconfig'; // Ajusta la ruta según tu proyecto
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';

/**
 * Modal personalizado para React Native
 */
function CustomModal({ visible, title, children, onClose }) {
  return (
    <Modal animationType="slide" transparent visible={visible}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{title}</Text>
          {children}
          <TouchableOpacity
            style={[styles.button, styles.modalClose]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function App() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');

  // Modal de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Modal de actualización
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [itemToUpdate, setItemToUpdate] = useState(null);
  const [updatedName, setUpdatedName] = useState('');

  // Modal de visualización ("Ver")
  const [showViewModal, setShowViewModal] = useState(false);
  const [itemToView, setItemToView] = useState(null);

  // Referencia a la colección "items" en Firestore
  const itemsCollectionRef = collection(db, 'items');

  // Crear un nuevo sueño
  const createItem = async () => {
    if (newItem.trim() === '') return;
    try {
      await addDoc(itemsCollectionRef, { name: newItem });
      setNewItem('');
      getItems();
    } catch (error) {
      console.error('Error al crear item: ', error);
    }
  };

  // Obtener todos los sueños
  const getItems = async () => {
    try {
      const data = await getDocs(itemsCollectionRef);
      setItems(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    } catch (error) {
      console.error('Error al obtener items: ', error);
    }
  };

  // Actualizar un sueño
  const updateItem = async (id, newName) => {
    if (!newName || newName.trim() === '') return;
    try {
      const itemDoc = doc(db, 'items', id);
      await updateDoc(itemDoc, { name: newName });
      getItems();
    } catch (error) {
      console.error('Error al actualizar item: ', error);
    }
  };

  // Eliminar un sueño
  const deleteItem = async (id) => {
    try {
      const itemDoc = doc(db, 'items', id);
      await deleteDoc(itemDoc);
      getItems();
    } catch (error) {
      console.error('Error al eliminar item: ', error);
    }
  };

  // Manejo de modales
  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteItem(itemToDelete.id);
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const handleUpdateClick = (item) => {
    setItemToUpdate(item);
    setUpdatedName(item.name);
    setShowUpdateModal(true);
  };

  const confirmUpdate = () => {
    if (itemToUpdate && updatedName.trim() !== '') {
      updateItem(itemToUpdate.id, updatedName);
      setShowUpdateModal(false);
      setItemToUpdate(null);
      setUpdatedName('');
    }
  };

  // Nuevo: Ver el contenido
  const handleViewClick = (item) => {
    setItemToView(item);
    setShowViewModal(true);
  };

  useEffect(() => {
    getItems();
  }, []);

  // Render de cada ítem en la lista
  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.itemName}>{item.name}</Text>
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.button, styles.viewBtn]}
          onPress={() => handleViewClick(item)}
        >
          <Text style={styles.buttonText}>Ver</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.updateBtn]}
          onPress={() => handleUpdateClick(item)}
        >
          <Text style={styles.buttonText}>Actualizar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.deleteBtn]}
          onPress={() => handleDeleteClick(item)}
        >
          <Text style={styles.buttonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>✨DIARIO DE SUEÑOS✨</Text>

      <View style={styles.inputGroup}>
        <TextInput
          style={styles.inputField}
          value={newItem}
          onChangeText={setNewItem}
          placeholder="Nuevo sueño"
          placeholderTextColor="#999"
        />
        <TouchableOpacity
          style={[styles.button, styles.addBtn]}
          onPress={createItem}
        >
          <Text style={styles.buttonText}>Agregar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />

      {/* Modal de eliminación */}
      <CustomModal
        visible={showDeleteModal}
        title="Confirmar Eliminación"
        onClose={() => setShowDeleteModal(false)}
      >
        <Text style={styles.modalText}>
          ¿Estás seguro de eliminar el sueño:
        </Text>
        <Text style={[styles.modalText, { fontWeight: 'bold' }]}>
          {itemToDelete?.name}?
        </Text>
        <TouchableOpacity
          style={[styles.button, styles.deleteBtn, { marginTop: 15 }]}
          onPress={confirmDelete}
        >
          <Text style={styles.buttonText}>Sí, eliminar</Text>
        </TouchableOpacity>
      </CustomModal>

      {/* Modal de actualización */}
      <CustomModal
        visible={showUpdateModal}
        title="Actualizar Sueño"
        onClose={() => setShowUpdateModal(false)}
      >
        <TextInput
          style={styles.inputField}
          value={updatedName}
          onChangeText={setUpdatedName}
          placeholder="Nuevo nombre"
          placeholderTextColor="#999"
        />
        <TouchableOpacity
          style={[styles.button, styles.updateBtn, { marginTop: 15 }]}
          onPress={confirmUpdate}
        >
          <Text style={styles.buttonText}>Guardar cambios</Text>
        </TouchableOpacity>
      </CustomModal>

      {/* Modal de visualización ("Ver") */}
      <CustomModal
        visible={showViewModal}
        title="Contenido del Sueño"
        onClose={() => setShowViewModal(false)}
      >
        <Text style={styles.modalText}>
          {itemToView?.name}
        </Text>
      </CustomModal>
    </View>
  );
}

const styles = StyleSheet.create({
  // Contenedor principal
  container: {
    flex: 1,
    backgroundColor: '#e6c06e',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    color: '#b8860b',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // Input + botón "Agregar"
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  inputField: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderColor: '#d4af37',
    borderWidth: 2,
    borderRadius: 4,
    fontSize: 16,
    color: '#000',
  },
  button: {
    minWidth: 60,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  addBtn: {
    backgroundColor: '#d4af37',
    marginLeft: 10,
  },
  viewBtn: {
    backgroundColor: '#967117', // color distinto para el botón "Ver"
  },
  updateBtn: {
    backgroundColor: '#b8860b',
  },
  deleteBtn: {
    backgroundColor: '#a0522d',
  },

  // Lista
  listContainer: {
    width: '100%',
    paddingBottom: 20,
  },

  // Cada ítem (sueño) en la lista
  item: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemName: {
    flex: 1,
    fontSize: 16,
    color: '#8b7500',
    marginRight: 10,
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Modales
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff8e1',
    width: '85%',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    color: '#b8860b',
    marginBottom: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#000',
    marginVertical: 5,
  },
  modalClose: {
    backgroundColor: '#d4af37',
    marginTop: 15,
  },
});
