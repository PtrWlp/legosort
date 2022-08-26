import { Injectable } from '@angular/core';
import {
  Firestore, addDoc, collection, collectionData,
  doc, deleteDoc, updateDoc, setDoc
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Part, PartInBox } from '../interfaces/legosort.interface';
import partsList from '../../../data/selectedParts.json';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private firestore: Firestore) { }

  addPartInBox(partInBox: PartInBox, userName: string) {
    const dbRef = collection(this.firestore, userName ?? 'partinbox');
    return addDoc(dbRef, partInBox);
  }

  updatePartInBox(partInBox: PartInBox, userName: string) {
    const dbRef = doc(this.firestore, `${userName ?? 'partinbox'}/${partInBox.id}`);
    return setDoc(dbRef, partInBox);
  }

  deletePartInBox(partInBox: PartInBox, userName: string) {
    const dbRef = doc(this.firestore, `${userName ?? 'partinbox'}/${partInBox.id}`);
    return deleteDoc(dbRef);
  }

  modifyBox(partInBox: PartInBox, box: string, userName: string) {
    const dbRef = doc(this.firestore, `${userName ?? 'partinbox'}/${partInBox.id}`);
    return updateDoc(dbRef, { box });
  }

  getAllPartInBox(userName: string): Observable<PartInBox[]> {
    const dataRef = collection(this.firestore, userName ?? 'partinbox');
    return collectionData(dataRef, { idField: 'id' }) as Observable<PartInBox[]>;
  }

  getAllParts = (): Part[] => {
    return partsList;
  }
}
