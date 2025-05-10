import StoryMap from '../../utils/map';
import api from '../../data/api';

class HomePresenter {
  constructor(view) {
    this._view = view;
    this._allStories = [];
    this._currentStories = [];
    this._currentPage = 1;
    this._pageSize = 6;
    this._isLoading = false;
    this._storyMap = null;
  }

  async initialize() {
    try {
      await this._initMap();
      await this._loadAllStories();
      this._setupPagination();
      this._renderCurrentPage();
    } catch (error) {
      console.error('Initialization error:', error);
      this._showError('Gagal memuat halaman');
    }
  }

  async _initMap() {
    try {
      this._storyMap = new StoryMap('storyMap');
    } catch (error) {
      console.error('Map initialization error:', error);
      this._view.hideMapContainer();
    }
  }

  async _loadAllStories() {
    this._showLoading(true);
    try {
      const response = await api.getAllStories();
      this._allStories = response.listStory;
    } catch (error) {
      console.error('Failed to fetch stories:', error);
      this._showError('Gagal memuat cerita');
    } finally {
      this._showLoading(false);
    }
  }

  _renderCurrentPage() {
    const startIdx = (this._currentPage - 1) * this._pageSize;
    this._currentStories = this._allStories.slice(startIdx, startIdx + this._pageSize);
    
    this._view.renderStories(this._currentStories);
    
    if (this._storyMap) {
      const storiesWithLocations = this._currentStories.filter(story => story.lat && story.lon);
      if (storiesWithLocations.length > 0) {
        this._storyMap.plotMarkers(storiesWithLocations);
      }
    }
  }

  _setupPagination() {
    const totalPages = Math.ceil(this._allStories.length / this._pageSize);
    this._view.setupPaginationControls({
      totalPages,
      currentPage: this._currentPage,
      onPrev: () => this._goToPrevPage(),
      onNext: () => this._goToNextPage()
    });
  }

  _goToPrevPage() {
    if (this._currentPage > 1) {
      this._currentPage--;
      this._renderCurrentPage();
      this._updatePaginationControls();
    }
  }

  _goToNextPage() {
    const totalPages = Math.ceil(this._allStories.length / this._pageSize);
    if (this._currentPage < totalPages) {
      this._currentPage++;
      this._renderCurrentPage();
      this._updatePaginationControls();
    }
  }

  _updatePaginationControls() {
    const totalPages = Math.ceil(this._allStories.length / this._pageSize);
    this._view.updatePaginationControls({
      totalPages,
      currentPage: this._currentPage
    });
  }

  _showLoading(isLoading) {
    this._isLoading = isLoading;
    this._view.showLoading(isLoading);
  }

  _showError(message) {
    this._view.showError(message);
  }
}

export default HomePresenter;