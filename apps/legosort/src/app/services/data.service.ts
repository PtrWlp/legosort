import { Injectable } from '@angular/core';
import {
  Firestore, addDoc, collection, collectionData,
  doc, docData, deleteDoc, updateDoc, DocumentReference, setDoc
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { PartInBox } from '../model/part-in-box';
import partsList from '../../../data/selectedParts.json';
import { Part } from '../model/part';
import { query, orderBy } from "firebase/firestore";
@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private firestore: Firestore) { }

  addPartInBox(partInBox: PartInBox) {
    const dbRef = collection(this.firestore, 'partinbox');
    return addDoc(dbRef, partInBox);
  }

  updatePartInBox(partInBox: PartInBox) {
    const dbRef = doc(this.firestore, `partinbox/${partInBox.id}`);
    return setDoc(dbRef, partInBox);
  }

  deletePartInBox(partInBox: PartInBox) {
    const dbRef = doc(this.firestore, `partinbox/${partInBox.id}`);
    return deleteDoc(dbRef);
  }

  modifyBox(partInBox: PartInBox, box: string) {
    const dbRef = doc(this.firestore, `partinbox/${partInBox.id}`);
    return updateDoc(dbRef, { box });
  }

  getAllPartInBox(): Observable<PartInBox[]> {
    const dataRef = collection(this.firestore, 'partinbox');
    return collectionData(dataRef, { idField: 'id' }) as Observable<PartInBox[]>;
  }

  getAllParts = (): Part[] => {
    return partsList;
  }
}
