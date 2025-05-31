function navItemMenu({ id }) {
    return {
      contextOpen: false,
      addOpen: false,
      toggleContext() {
        this.contextOpen = !this.contextOpen;
        this.addOpen = false;
      },
      toggleAdd() {
        this.addOpen = !this.addOpen;
        this.contextOpen = false;
      },
      rename() { console.log('Renommer', id) },
      remove() { console.log('Supprimer', id) },
      createRecord() { console.log('Créer record dans', id) },
      createTemplate() { console.log('Créer template dans', id) }
    }
  }
  